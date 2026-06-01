import { EXAM, STUDENT } from '@/data/const/api_url'
import { useQueryData } from '@/data/hooks/api/useGlobalFetch'
import { useAuthStore } from '@/data/store/auth_store'
import type { ApiPaginatedResponse, ApiResponseType } from '@/data/types/api_response'
import type { ExamHistoryDataType } from '@/data/validations/exam_schema'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { DataTable, type ColumnDef } from '@/components/DataTables'
import { IconClipboardCheck, IconCertificate } from '@tabler/icons-react'

export const Route = createFileRoute('/user/exam-history/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')
  const { user } = useAuthStore()

  const { data: summaryRes } = useQueryData<ApiResponseType<'single', any>>(
    STUDENT.EXAM_SUMMARY,
    { id: user?.id },
  )
  const summary = summaryRes?.data
  console.log(summary)

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
        return 'bg-secondary text-white'
      case 'completed':
        return 'bg-success text-white'
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
    ApiPaginatedResponse<ExamHistoryDataType>
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
        </div>
      ),
    },
    {
      header: 'Waktu Ujian',
      cell: (row) => (
        <div>
          <div className="text-muted small">Mulai: {formatDate(row.exam?.start_date)} </div>
          {/* <div className="text-muted small">Mulai: {formatDate(row.exam?.start_date)} {formatTime(row.exam?.start_date)}</div> */}
          {/* <div className="text-muted small">Selesai: {formatDate(row.exam?.end_date)} {formatTime(row.exam?.end_date)}</div> */}
        </div>
      ),
    },
    {
      header: 'TWK',
      cell: (v) => <span className="fw-medium">{v.userAnswers.find((item) => item.category_code.toLowerCase() === 'twk')?.score || '-'}</span>
    },
    {
      header: 'TIU',
      cell: (v) => <span className="fw-medium">{v.userAnswers.find((item) => item.category_code.toLowerCase() === 'tiu')?.score || '-'}</span>
    },
    {
      header: 'TKP',
      cell: (v) => <span className="fw-medium">{v.userAnswers.find((item) => item.category_code.toLowerCase() === 'tkp')?.score || '-'}</span>
    },
    {
      accessorKey: 'score',
      header: 'Nilai',
      cell: (row) => {
        const scoreSummary = row.userAnswers.reduce((acc: number, cur: any) => acc + cur.score, 0)
        return row.score !== null ? <span className="fw-bold">{row.score != scoreSummary ? scoreSummary : row.score}</span> : '-'
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => {
        let effectiveStatus = row.status
        if (
          effectiveStatus !== 'completed' &&
          row.exam?.end_date &&
          new Date(row.exam.end_date) < new Date()
        ) {
          effectiveStatus = 'expired'
        }
        return (
          <span
            className={`badge ${getStatusBadge(effectiveStatus)} rounded-pill`}
          >
            {getStatusText(effectiveStatus)}
          </span>
        )
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

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="bg-info-subtle text-info p-3 rounded">
                <IconClipboardCheck size={28} />
              </div>
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Total Ujian</div>
                <h3 className="fw-bold mb-0">{summary?.total_exam || 0}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="bg-warning-subtle text-warning p-3 rounded">
                <IconCertificate size={28} />
              </div>
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Rata-rata Nilai (Ujian Selesai)</div>
                <h3 className="fw-bold mb-0">{parseInt(summary?.completed_score_count) > 0 ? Math.round(summary?.completed_score_count / parseInt(summary?.completed_exam_count)) : 0}</h3>
              </div>
            </div>
          </div>
        </div>
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
            data={data?.data || []}
            showPageSize={false}
            pageIndex={page}
            rowCount={data?.pagination?.total_items || 0}
            onPageChange={(p) => setPage(p)}
            manualPagination
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}