import { EXAM } from '@/data/const/api_url'
import { useQueryData } from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponsePaginationType } from '@/data/types/api_response'
import type { ExamHistoryDataType } from '@/data/validations/exam_schema'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { DataTable, type ColumnDef } from '@/components/DataTables'

export const Route = createFileRoute('/user/exam-history/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning text-dark'
      case 'in_progress':
        return 'bg-success text-white'
      case 'completed':
        return 'bg-secondary text-white'
      case 'expired':
        return 'bg-danger text-white'
      default:
        return 'bg-light text-dark'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Akan Datang'
      case 'in_progress':
        return 'Sedang Berlangsung'
      case 'completed':
        return 'Selesai'
      case 'expired':
        return 'Kadaluarsa'
      default:
        return 'Unknown'
    }
  }

  const { data, isLoading } = useQueryData<
    ApiResponsePaginationType<ExamHistoryDataType>
  >(
    EXAM.HISTORY,
    {
      page,
      per_page: 15,
      ...(status && { status }),
    },
    // ['exam-history', page, status],
  )

  const columns: ColumnDef<ExamHistoryDataType>[] = [
    {
      header: 'No',
      cell: (row, index) => (page - 1) * 15 + index + 1,
      width: '50px',
    },
    {
      accessorKey: 'exam.title',
      header: 'Judul Ujian',
      cell: (row) => (
        <div>
          <div className="fw-bold">{row.exam?.title || '-'}</div>
          <small className="text-muted">
            {row.exam?.description || '-'}
          </small>
        </div>
      ),
    },
    {
      header: 'Waktu Ujian',
      cell: (row) => (
        <div>
          <div className="text-muted small">Mulai: {formatDate(row.start_time)} {formatTime(row.start_time)}</div>
          <div className="text-muted small">Selesai: {formatDate(row.end_time)} {formatTime(row.end_time)}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => (
        <span
          className={`badge ${getStatusBadge(row.status)} rounded-pill`}
        >
          {getStatusText(row.status)}
        </span>
      ),
    },
    {
      accessorKey: 'score',
      header: 'Nilai',
      cell: (row) => {
        return row.score !== null ? <span className="fw-bold">{row.score}</span> : '-'
      },
    },
    {
      header: 'Aksi',
      cell: (row) => (
        <Link
          to={`/user/exam-history/${row.id}`}
          className="btn btn-sm btn-primary"
        >
          <i className="ti ti-eye me-1"></i>
          Detail
        </Link>
      ),
    },
  ]

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h4 className="fw-bold mb-2">Riwayat Ujian</h4>
        <p className="text-muted mb-0">Daftar riwayat ujian yang pernah Anda ikuti</p>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-end mb-3">
            <select
              className="form-select w-auto"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="pending">Akan Datang</option>
              <option value="in_progress">Sedang Berlangsung</option>
              <option value="completed">Selesai</option>
              <option value="expired">Kadaluarsa</option>
            </select>
          </div>

          <DataTable
            columns={columns}
            data={data?.data?.data || []}
            showPageSize={false}
            pageIndex={page}
            rowCount={data?.data?.pagination?.total || 0}
            onPageChange={(p) => setPage(p)}
            manualPagination
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
