import { Users, FileText, MonitorPlay } from 'lucide-react'
import { DASHBOARD } from '@/data/const/api_url'
import { useQueryData } from '@/data/hooks/api/useGlobalFetch'
import { DashboardSummarySkeleton } from './DashboardSkeleton'

export default function DashboardSummaryCards() {
  const { data, isLoading } = useQueryData<{
    success: boolean
    data: {
      total_students: number
      total_question_banks: number
      total_exams: number
    }
  }>(DASHBOARD.SUMMARY)

  if (isLoading) {
    return <DashboardSummarySkeleton />
  }

  const summaryData = data?.data

  const cards = [
    {
      title: 'Total Siswa Terdaftar',
      value: summaryData?.total_students || 0,
      Icon: Users,
      bgClass: 'bg-primary text-white',
      textClass: 'text-primary'
    },
    {
      title: 'Total Bank Soal',
      value: summaryData?.total_question_banks || 0,
      Icon: FileText,
      bgClass: 'bg-success text-white',
      textClass: 'text-success'
    },
    {
      title: 'Total Ujian',
      value: summaryData?.total_exams || 0,
      Icon: MonitorPlay,
      bgClass: 'bg-info text-white',
      textClass: 'text-info'
    },
  ]

  return (
    <div className="row mb-4">
      {cards.map((card, index) => (
        <div key={index} className="col-md-4 mb-4 mb-md-0">
          <div className="card border-0 shadow-sm h-100 overflow-hidden position-relative hover-lift transition-all">
            <div className="card-body d-flex align-items-center p-4 z-1">
              <div 
                className={`rounded-3 d-flex align-items-center justify-content-center me-3 shadow-sm ${card.bgClass}`}
                style={{ width: '56px', height: '56px' }}
              >
                <card.Icon size={28} />
              </div>
              <div>
                <p className="text-muted mb-1 fw-semibold" style={{ fontSize: '0.875rem' }}>{card.title}</p>
                <h3 className="mb-0 fw-bold text-dark">
                  {card.value.toLocaleString('id-ID')}
                </h3>
              </div>
            </div>
            {/* Decorative background icon */}
            <div className="position-absolute opacity-10" style={{ right: '-15px', bottom: '-15px', transform: 'rotate(-15deg)' }}>
              <card.Icon size={100} className={card.textClass} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
