import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { DataTable } from '@/components/DataTables'
import type { ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { useState } from 'react'
import { IconSearch, IconArrowLeft, IconMail, IconPhone, IconMapPin, IconId, IconCertificate, IconClipboardCheck, IconUser, IconDownload, IconTrash } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { EXAM, STUDENT } from '@/data/const/api_url'
import { useMutationAction, useQueryData } from '@/data/hooks/api/useGlobalFetch'
import { getToken } from '@/lib/token-handler'
import { deleteDataAlert, toaster } from '@/lib/toast'
import type { ApiResponseType, ApiResponsePaginationType } from '@/data/types/api_response'

export const Route = createFileRoute('/admin/master/student-detail/$studentId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { studentId } = Route.useParams()
  const navigate = useNavigate()
  
  // States for Exam History Table
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data: studentRes, isLoading: studentLoading } = useQueryData<ApiResponseType<'single', any>>(
    STUDENT.GET_BY_ID,
    { id: studentId }
  )
  
  const { data: examHistoryRes, isLoading: examHistoryLoading } = useQueryData<ApiResponsePaginationType<any>>(
    STUDENT.EXAM_HISTORY,
    { 
      id: studentId,
      page,
      per_page: 10,
      search: search || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined
    }
  )

  const student = studentRes?.data
  const examHistory = examHistoryRes
  const totalExamUser = student?.user_exams?.filter((item: any) => item.status == 'completed') || []
  const scoreSummary = totalExamUser?.reduce((acc: number, cur: any) => acc + cur.score, 0)
  const averageScore = scoreSummary > 0 ? scoreSummary / totalExamUser.length : 0
  
  const [isExporting, setIsExporting] = useState(false)

  const { trigger: deleteUserExamTrigger } = useMutationAction(
    EXAM.DELETE_USER,
    'delete',
    { refreshKey: [STUDENT.EXAM_HISTORY, STUDENT.GET_BY_ID] },
  )

  const handleDeleteUserExam = (examHistoryItem: any) => {
    deleteDataAlert(examHistoryItem.exam_name, () => {
      deleteUserExamTrigger({ id: examHistoryItem.exam_history_id })
    })
  }

  const handleExportExcel = async () => {
    try {
      setIsExporting(true)
      const baseUrl = import.meta.env.VITE_API_URL
      const token = getToken()
      
      // Build URL with query params
      const endpoint = STUDENT.EXAM_HISTORY_EXPORT.replace('{id}', studentId)
      const url = new URL(`${baseUrl}${endpoint}`)
      if (search) url.searchParams.append('search', search)
      if (startDate) url.searchParams.append('start_date', startDate)
      if (endDate) url.searchParams.append('end_date', endDate)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Gagal mengekspor data riwayat ujian')
      }

      const result = await response.json()
      
      if (result.success && result.data?.download_url) {
        window.open(result.data.download_url, '_blank')
        toaster(result.message || 'Export berhasil', 'success')
      } else {
        throw new Error(result.message || 'Format response tidak sesuai')
      }
    } catch (error: any) {
      console.error('Export error:', error)
      toaster(error.message || 'Terjadi kesalahan saat export excel', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const columns: ColumnDef<any>[] = [
    { header: '#', cell: (_, i) => (page - 1) * 10 + i + 1 },
    { 
      header: 'Nama Ujian', 
      cell: (v) => (
        <div>
          <span className="fw-semibold">{v.exam_name}</span>
          <div className="text-muted small">
            {dayjs(v.start_time).format('DD MMM YYYY, HH:mm')} - {dayjs(v.end_time).format('HH:mm')}
          </div>
        </div>
      )
    },
    { 
      header: 'TWK', 
      cell: (v) => <span className="fw-medium">{v.score_twk}</span>
    },
    { 
      header: 'TIU', 
      cell: (v) => <span className="fw-medium">{v.score_tiu}</span>
    },
    { 
      header: 'TKP', 
      cell: (v) => <span className="fw-medium">{v.score_tkp}</span>
    },
    { 
      header: 'Total Skor', 
      cell: (v) => <span className="fw-bold text-primary">{v.total_score}</span>
    },
    {
      header: 'Aksi',
      cell: (v) => (
        <button
          type="button"
          className="btn btn-sm rounded-1 btn-danger"
          title="Hapus Riwayat Ujian"
          onClick={() => handleDeleteUserExam(v)}
        >
          <IconTrash size={16} />
        </button>
      ),
    },
    // { 
    //   header: 'Status Lulus', 
    //   cell: (v) => (
    //     <span className={`badge ${v.is_passed ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
    //       {v.is_passed ? 'Lulus' : 'Tidak Lulus'}
    //     </span>
    //   )
    // },
  ]

  if (studentLoading) {
    return <div className="p-4 text-center">Loading...</div>
  }

  if (!student) {
    return <div className="p-4 text-center">Data siswa tidak ditemukan.</div>
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header Navigation */}
      <div className="d-flex align-items-center justify-content-between">
        <button 
          className="btn btn-light d-flex align-items-center gap-2"
          onClick={() => window.history.back()}
        >
          <IconArrowLeft size={18} /> Kembali
        </button>
      </div>

      {/* Profile & Summary Section */}
      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-12 col-xl-8">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex align-items-start gap-4">
                <div 
                  className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" 
                  style={{ width: '80px', height: '80px' }}
                >
                  <IconUser size={40} />
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h4 className="fw-bold mb-1">{student?.name}</h4>
                      <span className={`badge ${student?.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                        {student?.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <span className="badge bg-primary-subtle text-primary px-3 py-2 fs-6">
                      {student?.group?.name || '-'}
                    </span>
                  </div>
                  
                  <div className="row g-3 mt-2 text-muted">
                    <div className="col-12 col-md-6 d-flex align-items-center gap-2">
                      <IconMail size={18} /> {student?.email}
                    </div>
                    <div className="col-12 col-md-6 d-flex align-items-center gap-2">
                      <IconPhone size={18} /> {student?.phone || '-'}
                    </div>
                    <div className="col-12 col-md-6 d-flex align-items-center gap-2">
                      <IconId size={18} /> NISN: {student?.nisn || '-'}
                    </div>
                    <div className="col-12 col-md-6 d-flex align-items-center gap-2">
                      <IconMapPin size={18} /> {student?.address || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="col-12 col-xl-4">
          <div className="d-flex flex-column gap-3 h-100">
            <div className="card border-0 shadow-sm flex-grow-1">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="bg-info-subtle text-info p-3 rounded">
                  <IconClipboardCheck size={28} />
                </div>
                <div>
                  <div className="text-muted small fw-semibold text-uppercase">Total Ujian Selesai</div>
                  <h3 className="fw-bold mb-0">{totalExamUser.length || 0}</h3>
                </div>
              </div>
            </div>
            <div className="card border-0 shadow-sm flex-grow-1">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="bg-warning-subtle text-warning p-3 rounded">
                  <IconCertificate size={28} />
                </div>
                <div>
                  <div className="text-muted small fw-semibold text-uppercase">Rata-rata Nilai</div>
                  <h3 className="fw-bold mb-0">{averageScore}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exam History Section */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">Riwayat Ujian</h5>
          <button 
            type="button" 
            className="btn btn-success d-flex align-items-center gap-2"
            onClick={handleExportExcel}
            disabled={isExporting}
          >
            <IconDownload size={18} />
            {isExporting ? 'Mengekspor...' : 'Export Excel'}
          </button>
        </div>
        <div className="card-body p-4">
          {/* Filters */}
          <div className="d-flex flex-column flex-md-row gap-3 mb-4">
            <div className="input-group input-group-sm w-auto flex-grow-1" style={{ maxWidth: '300px' }}>
              <DebouncedInput
                value={search}
                onChange={(v) => setSearch(String(v))}
                className="form-control bg-white"
                placeholder="Cari nama ujian..."
              />
              <button type="button" className="btn btn-primary py-2 px-3">
                <IconSearch size={18} />
              </button>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <input 
                type="date" 
                className="form-control form-control-sm" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Tanggal Mulai"
              />
              <span>-</span>
              <input 
                type="date" 
                className="form-control form-control-sm" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Tanggal Akhir"
              />
            </div>
          </div>

          {/* Table */}
          <DataTable
            data={examHistory?.data?.data || []}
            columns={columns}
            showPageSize={false}
            pageIndex={page || 1}
            rowCount={examHistory?.data?.pagination?.total_items || 0}
            onPageChange={setPage}
            manualPagination
          />
        </div>
      </div>
    </div>
  )
}
