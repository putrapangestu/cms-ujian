import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { EXAM } from '@/data/const/api_url'
import { useMutationAction, useQueryData } from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponsePaginationType } from '@/data/types/api_response'
import type { ExamDataType } from '@/data/validations/exam_schema'
import { IconCopy, IconEdit, IconEye, IconSearch, IconTrash } from '@tabler/icons-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import ExamModalCreate from '../-components/exam-modal-create'
import dayjs from 'dayjs'
import { formatDate, formatTime } from '@/lib/date-format'
import { confirmAlert } from '@/lib/toast'

export const Route = createFileRoute('/admin/exam/exam-data/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [examTypeFilter, setExamTypeFilter] = useState('')
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
  }, [search, examTypeFilter])

  const { data, isLoading, refetch } = useQueryData<ApiResponsePaginationType<ExamDataType>>(
    EXAM.GET,
    { page: page, per_page: 10, search: search, ...(examTypeFilter && { exam_type: examTypeFilter }) },
  )

  const { trigger: deleteExam } = useMutationAction(
    EXAM.DELETE,
    'delete',
    { refreshKey: EXAM.GET }
  )

  const { trigger: copyExam } = useMutationAction(
    EXAM.COPY,
    'post',
    { refreshKey: EXAM.GET }
  )

  const handleDelete = (exam: ExamDataType) => {
    confirmAlert(
      'Hapus Ujian',
      async () => await deleteExam({ id: exam.id }),
      `Apakah Anda yakin ingin menghapus ujian "${exam.title}"?`,
      () => {
        if (refetch) refetch()
      }
    )
  }

  const handleCopy = (exam: ExamDataType) => {
    confirmAlert(
      'Duplikasi Ujian',
      async () => await copyExam({ id: exam.id }),
      `Duplikasi ujian "${exam.title}"? Semua soal akan disalin, peserta tidak ikut.`,
      () => {
        if (refetch) refetch()
      }
    )
  }

  const columns: ColumnDef<ExamDataType>[] = [
    { header: '#', cell: (_, i) => i + 1, width: '40px' },
    { header: 'Nama Ujian', accessorKey: 'title', width: '22%' },
    {
      header: 'Tipe',
      width: '60px',
      cell(row) {
        const isPretest = row.exam_type === 'pretest'
        return (
          <span className={`badge ${isPretest ? 'bg-warning text-dark' : 'bg-primary'}`}>
            {isPretest ? 'Pretest' : 'SKD'}
          </span>
        )
      },
    },
    { header: 'Mulai Ujian', width: '13%', cell: (row, index) => {
        return <span className='text-nowrap'>
          { formatDate(row.start_date) }  { formatTime(row.start_date) }
        </span>
      }
    },
    { header: 'Selesai Ujian', width: '13%', cell: (row, index) => {
        return <span className='text-nowrap'>
          { formatDate(row.end_date) }  { formatTime(row.end_date) }
        </span>
      }
    },
    {
      header: 'Jml Soal',
      width: '70px',
      cell(row, index) {
        return (
          <span className="badge bg-success-subtle text-success">
            {row.total_questions}
          </span>
        )
      },
    },
    {
      header: 'Jml Bank Soal',
      width: '80px',
      cell(row, index) {
        return (
          <span className="badge bg-success-subtle text-success">
            {row.question_exams_count ?? 0}
          </span>
        )
      },
    },
    {
      header: 'Group Peserta',
      width: '17%',
      cell: (v) => {
        const groups = v.studentGroups
        if (!groups || groups.length === 0)
          return <span className="text-muted">-</span>
        return (
          <div className="d-flex flex-wrap gap-1">
            {groups.map((g) => (
              <span
                key={g.id}
                className="badge bg-info-subtle text-info px-2 py-1"
                style={{ fontSize: '.75rem' }}
              >
                {g.name}
              </span>
            ))}
          </div>
        )
      },
    },
    {
      header: 'Aksi',
      width: '170px',
      cell: (v) => (
        <div className="d-flex align-items-center gap-1">
          <button
            type="button"
            className="btn btn-sm rounded-1 btn-info"
            onClick={() => navigate({ to: `/admin/exam/exam-data/${v.id}` })}
          >
            <IconEye size={16} />
          </button>
          <button
            type="button"
            className="btn btn-sm rounded-1 btn-secondary"
            onClick={() => handleCopy(v)}
            title="Duplikasi Ujian"
          >
            <IconCopy size={16} />
          </button>
          <button
            type="button"
            className="btn btn-sm rounded-1 btn-warning"
            onClick={() => clickOpenModalHandle(v)}
          >
            <IconEdit size={16} />
          </button>
          <button
            type="button"
            className="btn btn-sm rounded-1 btn-danger"
            onClick={() => handleDelete(v)}
          >
            <IconTrash size={16} />
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
            <select
              className="form-select w-auto"
              value={examTypeFilter}
              onChange={(e) => setExamTypeFilter(e.target.value)}
            >
              <option value="">Semua Tipe</option>
              <option value="skd">SKD</option>
              <option value="pretest">Pretest</option>
            </select>
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
            noScroll
          />
        </div>
      </div>
    </>
  )
}
