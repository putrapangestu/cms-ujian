import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { EXAM } from '@/data/const/api_url'
import { useQueryData } from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponsePaginationType } from '@/data/types/api_response'
import type { ExamDataType } from '@/data/validations/exam_schema'
import { IconEdit, IconEye, IconSearch, IconTrash } from '@tabler/icons-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import ExamModalCreate from '../-components/exam-modal-create'
import dayjs from 'dayjs'
import { formatDate, formatTime } from '@/lib/date-format'

export const Route = createFileRoute('/admin/exam/exam-data/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [current, setCurrent] = useState<ExamDataType>()

  useEffect(() => {
    const handleHidden = () => {
      setCurrent(undefined)
      setIsEdit(false)
    }
    $('#exam-modal-create').on('hidden.bs.modal', handleHidden)
    return () => {
      $('#exam-modal-create').off('hidden.bs.modal', handleHidden)
    }
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search])

  const { data, isLoading } = useQueryData<ApiResponsePaginationType<ExamDataType>>(
    EXAM.GET,
    { page: page, per_page: 10, search: search },
  )

  const columns: ColumnDef<ExamDataType>[] = [
    { header: '#', cell: (_, i) => i + 1 },
    { header: 'Nama Ujian', accessorKey: 'title' },
    { header: 'Tanggal', cell: (v) => formatDate(v.start_date) },
    { header: 'Waktu Mulai', cell: (v) => formatTime(v.start_date) },
    { header: 'Waktu Selesai', cell: (v) => formatTime(v.end_date) },
    // {
    //   header: 'Nilai Minimum',
    //   cell(row, index) {
    //     return (
    //       <span className="badge bg-success-subtle text-success">
    //         {row.passing_score}
    //       </span>
    //     )
    //   },
    // },
    {
      header: 'Jumlah Soal Ujian',
      cell(row, index) {
        return (
          <span className="badge bg-success-subtle text-success">
            {row.total_questions}
          </span>
        )
      },
    },
    {
      header: 'Jumlah Bank Soal',
      cell(row, index) {
        return (
          <span className="badge bg-success-subtle text-success">
            {row.question_exams_count}
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
            className="btn btn-md rounded-1 btn-info"
            onClick={() => navigate({ to: `/admin/exam/exam-data/${v.id}` })}
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
          <button type="button" className="btn btn-md rounded-1 btn-danger">
            <IconTrash size={18} />
          </button>
        </div>
      ),
    },
  ]

  const clickOpenModalHandle = (exam?: ExamDataType) => {
    setIsEdit(exam ? true : false)
    setCurrent(exam ? { ...exam } : undefined)
    $('#exam-modal-create').modal('show')
  }

  return (
    <>
      <ExamModalCreate isEdit={isEdit} exam={current} />
      <div className="card">
        <div className="border-bottom p-4 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title fw-bolder">Data Ujian</h5>
            <p className="p-0">List informasi ujian</p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => clickOpenModalHandle()}
          >
            Tambah Ujian
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
            isLoading={isLoading}
          />
        </div>
      </div>
    </>
  )
}
