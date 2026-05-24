import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { IconEdit, IconSearch, IconSortAscending, IconTrash } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import QuestionCategoryModalCreate from './-components/question-category-modal-add'
import QuestionGroupRangeModal from './-components/question-group-range-modal'
import type { QuestionCategoryDataType } from '@/data/validations/question_schema'
import { QUESTION_CATEGORY } from '@/data/const/api_url'
import {
  useMutationAction,
  useQueryData,
} from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponsePaginationType } from '@/data/types/api_response'
import { deleteDataAlert } from '@/lib/toast'

export const Route = createFileRoute('/admin/question-bank/question-category')({
  component: RouteComponent,
})

function RouteComponent() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [current, setCurrent] = useState<QuestionCategoryDataType>()
  const [rangeCategory, setRangeCategory] = useState<{
    id: string
    name: string
  } | null>(null)

  const { data } = useQueryData<
    ApiResponsePaginationType<QuestionCategoryDataType>
  >(QUESTION_CATEGORY.GET)
  const { trigger: deleteTrigger } = useMutationAction(
    QUESTION_CATEGORY.DELETE,
    'delete',
    { refreshKey: QUESTION_CATEGORY.GET },
  )

  const clickDeleteHandle = (question: QuestionCategoryDataType) => {
    deleteDataAlert(question.name, () => deleteTrigger({ id: question.id }))
  }

  const columns: ColumnDef<QuestionCategoryDataType>[] = [
    { header: '#', cell: (_, i) => i + 1 },
    { header: 'Nama Kategori', accessorKey: 'name' },
    {
      header: 'Range Soal',
      cell: (v) => {
        return (
          <p className="mb-0">
            {v.start_range} - {v.end_range}
          </p>
        )
      },
    },
    { header: 'Deskripsi', accessorKey: 'description' },
    {
      header: 'Kode',
      cell(row, index) {
        return (
          <span className="badge bg-success-subtle text-success">
            {row.code}
          </span>
        )
      },
    },
    {
      header: 'Aksi',
      cell: (v) => (
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-md rounded-1 btn-outline-info"
            title="Atur Urutan Soal"
            onClick={() => clickOpenRangeModal(v)}
          >
            <IconSortAscending size={18} />
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

  const clickOpenModalHandle = (
    questionCategory?: QuestionCategoryDataType,
  ) => {
    setIsEdit(questionCategory ? true : false)
    setCurrent(questionCategory)
    $('#question-category-modal-create').modal('show')
  }

  const clickOpenRangeModal = (category: QuestionCategoryDataType) => {
    setRangeCategory({ id: category.id, name: category.name })
    $('#question-group-range-modal').modal('show')
  }

  const closeRangeModal = () => {
    setRangeCategory(null)
  }

  return (
    <>
      <QuestionCategoryModalCreate isEdit={isEdit} questionCategory={current} />
      {rangeCategory && (
        <QuestionGroupRangeModal
          categoryId={rangeCategory.id}
          categoryName={rangeCategory.name}
        />
      )}
      <div className="card">
        <div className="border-bottom p-4 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title fw-bolder">Kategori Soal</h5>
            <p className="p-0">List informasi kategori soal</p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => clickOpenModalHandle()}
          >
            Tambah Kategori Soal
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
            rowCount={data?.data?.length || 0}
            onPageChange={setPage}
            manualPagination
          />
        </div>
      </div>
    </>
  )
}
