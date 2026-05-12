import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { QUESTION_GROUP } from '@/data/const/api_url'
import {
  useMutationAction,
  useQueryData,
} from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponsePaginationType } from '@/data/types/api_response'
import type {
  QuestionGroupDataType,
  QuestionGroupType,
} from '@/data/validations/question_schema'
import { IconEdit, IconEye, IconSearch, IconTrash } from '@tabler/icons-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { deleteDataAlert } from '@/lib/toast'
import QuestionGroupModalCreate from '../-components/question-group-modal-create'

export const Route = createFileRoute('/admin/question-bank/question-group/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [perPage] = useState(10)
  const [search, setSearch] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [current, setCurrent] = useState<QuestionGroupDataType>()

  const { data } = useQueryData<
    ApiResponsePaginationType<QuestionGroupDataType>
  >(QUESTION_GROUP.GET, {
    per_page: perPage,
    page: page,
    search: search || undefined,
  })
  const { trigger: deleteTrigger } = useMutationAction(
    QUESTION_GROUP.DELETE,
    'delete',
    { refreshKey: QUESTION_GROUP.GET },
  )

  const clickDeleteHandle = (question: QuestionGroupDataType) => {
    deleteDataAlert(question.name, () => deleteTrigger({ id: question.id }))
  }

  const columns: ColumnDef<QuestionGroupDataType>[] = [
    { header: '#', cell: (_, i) => i + 1 },
    {
      header: 'Tipe',
      cell: (v) => (
        <>
          <h6>{v.name}</h6>
          <span className="text-muted">{v.code}</span>
        </>
      ),
    },
    {
      header: 'Kategori',
      cell(row, index) {
        return (
          <span className="badge bg-success-subtle text-success">
            {row.question_category?.code}
          </span>
        )
      },
    },
    {
      header: 'No. Soal',
      cell: (v) => (
        <span className="badge bg-primary-subtle text-primary px-2 py-1">
          {v.number_start ?? '-'} s/d {v.number_end ?? '-'}
        </span>
      ),
    },
    {
      header: 'Deskripsi',
      cell: (v) => (
        <span className="text-truncate w-100 d-block">
          {v?.description || '-'}
        </span>
      ),
    },
    {
      header: 'Aksi',
      cell: (v) => (
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-md btn-info rounded-1"
            onClick={() =>
              navigate({ to: `/admin/question-bank/question-group/${v.id}` })
            }
          >
            <IconEye size={18} />
          </button>
          <button
            type="button"
            className="btn btn-md rounded-1 btn-warning"
            onClick={() => clickOpenModalHandle(v)}
          >
            <IconEdit size={18} />
          </button>
          <button
            type="button"
            className="btn btn-md rounded-1 btn-danger"
            onClick={() => clickDeleteHandle(v)}
          >
            <IconTrash size={18} />
          </button>
        </div>
      ),
    },
  ]

  const clickOpenModalHandle = (questionGroup?: QuestionGroupDataType) => {
    setIsEdit(questionGroup ? true : false)
    setCurrent(questionGroup)
    $('#question-group-modal-create').modal('show')
  }

  return (
    <>
      <QuestionGroupModalCreate isEdit={isEdit} questionGroup={current} />
      <div className="card">
        <div className="border-bottom p-4 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title fw-bolder">Tipe Soal / Grup Soal</h5>
            <p>List informasi tipe / grup soal</p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => clickOpenModalHandle()}
          >
            Tambah Tipe Soal
          </button>
        </div>
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2 mb-3">
            <div className="input-group input-group-sm w-auto">
              <DebouncedInput
                value={search}
                onChange={(v) => setSearch(String(v))}
                className="form-control bg-white"
                placeholder="cari..."
              />
              <button type="button" className="btn btn-primary py-2">
                <IconSearch size={18} />
              </button>
            </div>
          </div>
          <DataTable
            data={data?.data || []}
            columns={columns}
            showPageSize={false}
            pageIndex={page || 1}
            rowCount={data?.pagination?.total_items || 0}
            onPageChange={setPage}
            manualPagination
          />
        </div>
      </div>
    </>
  )
}
