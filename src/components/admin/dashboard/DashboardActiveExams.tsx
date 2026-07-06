import { DASHBOARD } from '@/data/const/api_url'
import { useQueryData } from '@/data/hooks/api/useGlobalFetch'
import { Link } from '@tanstack/react-router'
import { Activity, ChevronRight, Clock } from 'lucide-react'
import dayjs from 'dayjs'

type ActiveExam = {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  total_participants: number
  participants_pending: number
  participants_in_progress: number
  participants_completed: number
}

export default function DashboardActiveExams() {
  const { data, isLoading } = useQueryData<{
    success: boolean
    data: ActiveExam[]
  }>(DASHBOARD.ACTIVE_EXAMS)

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse h-full">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full mt-4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const activeExams = data?.data || []

  return (
    <div className="card border-0 shadow-sm h-100 overflow-hidden d-flex flex-column">
      <div className="card-header bg-white border-bottom p-4 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <div className="bg-success bg-opacity-10 text-success p-2 rounded-3 me-3">
            <Activity size={20} />
          </div>
          <div>
            <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>Ujian Aktif</h5>
            <small className="text-muted fw-medium">Sedang berlangsung hari ini</small>
          </div>
        </div>
        <Link
          to="/admin/exam"
          className="btn btn-sm btn-light text-primary fw-bold d-flex align-items-center"
        >
          Semua <ChevronRight size={16} className="ms-1" strokeWidth={3} />
        </Link>
      </div>

      <div className="card-body p-4 overflow-auto" style={{ maxHeight: '450px' }}>
        {activeExams.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted py-5">
            <Clock size={48} className="mb-3 opacity-25" />
            <p className="fw-medium">Tidak ada ujian yang sedang berlangsung</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {activeExams.map((exam) => {
              const total = exam.total_participants || 1
              const completedPct = (exam.participants_completed / total) * 100
              const inProgressPct = (exam.participants_in_progress / total) * 100
              
              return (
                <div key={exam.id} className="border rounded-3 p-3 bg-white hover-bg-light transition-colors">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="pe-3">
                      <Link 
                        to={`/admin/exam/${exam.id}/realtime`} 
                        className="fw-bold text-dark text-decoration-none hover-text-primary text-truncate d-block"
                        style={{ maxWidth: '200px' }}
                      >
                        {exam.title}
                      </Link>
                      <p className="text-muted mt-1 mb-0 d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                        <Clock size={14} className="me-1 opacity-50" />
                        {dayjs(exam.start_date).format('HH:mm')} - {dayjs(exam.end_date).format('HH:mm')}
                      </p>
                    </div>
                    <span className="badge bg-light text-secondary rounded-pill px-2 py-1 border border-secondary border-opacity-25">
                      {exam.total_participants} Peserta
                    </span>
                  </div>

                  <div className="d-flex justify-content-between mb-2 mt-3 fw-bold" style={{ fontSize: '0.7rem' }}>
                    <span className="text-success d-flex align-items-center">
                      <span className="rounded-circle bg-success d-inline-block me-1" style={{ width: '6px', height: '6px' }}></span> 
                      {exam.participants_completed} Selesai
                    </span>
                    <span className="text-warning d-flex align-items-center">
                      <span className="rounded-circle bg-warning d-inline-block me-1" style={{ width: '6px', height: '6px' }}></span> 
                      {exam.participants_in_progress} Mengerjakan
                    </span>
                    <span className="text-muted d-flex align-items-center">
                      <span className="rounded-circle bg-secondary d-inline-block me-1" style={{ width: '6px', height: '6px' }}></span> 
                      {exam.participants_pending} Belum
                    </span>
                  </div>

                  <div className="progress rounded-pill bg-light" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: `${completedPct}%` }}
                      title={`${exam.participants_completed} Selesai`}
                    ></div>
                    <div 
                      className="progress-bar bg-warning"
                      role="progressbar"
                      style={{ width: `${inProgressPct}%` }}
                      title={`${exam.participants_in_progress} Mengerjakan`}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
