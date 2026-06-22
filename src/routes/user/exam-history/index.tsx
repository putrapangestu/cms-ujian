import { EXAM, STUDENT } from '@/data/const/api_url'
import { useQueryData } from '@/data/hooks/api/useGlobalFetch'
import { useAuthStore } from '@/data/store/auth_store'
import type { ApiPaginatedResponse, ApiResponseType } from '@/data/types/api_response'
import type { ExamHistoryDataType } from '@/data/validations/exam_schema'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { DataTable, type ColumnDef } from '@/components/DataTables'
import { IconClipboardCheck, IconCertificate } from '@tabler/icons-react'
import { DebouncedInput } from '@/components/DebounceInput'

export const Route = createFileRoute('/user/exam-history/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [examTypeFilter, setExamTypeFilter] = useState('')
  const { user } = useAuthStore()

  const { data: summaryRes } = useQueryData<ApiResponseType<'single', any>>(
    STUDENT.EXAM_SUMMARY,
    { id: user?.id },
  )
  const summary = summaryRes?.data

  // Reset page ke 1 saat filter berubah
  useEffect(() => { setPage(1) }, [search, startDate, endDate, status, examTypeFilter])
  const averageScoreSkd = (summary as any)?.average_score_skd ?? 0
  const averageScorePretest = (summary as any)?.average_score_pretest ?? 0
  const totalExamSkd = (summary as any)?.total_exam_completed_skd ?? 0
  const totalExamPretest = (summary as any)?.total_exam_completed_pretest ?? 0

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
      ...(search && { search }),
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
      ...(examTypeFilter && { exam_type: examTypeFilter }),
    },
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
              <div className="bg-primary p-3 rounded">
                <IconCertificate size={28} className="text-white" />
              </div>
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Rata-rata SKD</div>
                <h3 className="fw-bold mb-0">{averageScoreSkd}</h3>
                <small className="text-muted">{totalExamSkd} ujian</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="bg-warning p-3 rounded">
                <IconClipboardCheck size={28} className="text-dark" />
              </div>
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Rata-rata Pretest</div>
                <h3 className="fw-bold mb-0">{averageScorePretest}</h3>
                <small className="text-muted">{totalExamPretest} ujian</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2 mb-3">
            <DebouncedInput
              value={search}
              onChange={(v) => setSearch(String(v))}
              className="form-control bg-white"
              placeholder="cari ujian..."
              style={{ width: '250px' }}
            />
            <input
              type="date"
              className="form-control w-auto"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="form-control w-auto"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <select
              className="form-select w-auto"
              value={examTypeFilter}
              onChange={(e) => setExamTypeFilter(e.target.value)}
            >
              <option value="">Semua Tipe</option>
              <option value="skd">SKD</option>
              <option value="pretest">Pretest</option>
            </select>
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