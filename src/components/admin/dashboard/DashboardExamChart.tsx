import { useState } from 'react'
import { DASHBOARD } from '@/data/const/api_url'
import { useQueryData } from '@/data/hooks/api/useGlobalFetch'
import Chart from 'react-apexcharts'
import { BarChart3, Trophy, ChevronRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { DashboardChartSkeleton, DashboardListSkeleton } from './DashboardSkeleton'

export default function DashboardExamChart() {
  const [year, setYear] = useState<number>(new Date().getFullYear())

  const { data, isLoading } = useQueryData<{
    success: boolean
    data: {
      trend_chart: { month: number; month_name: string; total_participants: number }[]
      top_exams: {
        id: string
        title: string
        total_participants: number
      }[]
    }
  }>(DASHBOARD.CHARTS_EXAMS, { year })

  if (isLoading && !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2">
          <DashboardChartSkeleton />
        </div>
        <div className="lg:col-span-1">
          <DashboardListSkeleton />
        </div>
      </div>
    )
  }

  const rawTrendChart = data?.data?.trend_chart
  const chartData = Array.isArray(rawTrendChart)
    ? rawTrendChart.map((d: any) => (typeof d === 'number' ? d : d?.total_participants ?? 0))
    : Array(12).fill(0)
  const topExams = data?.data?.top_exams || []

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const options = {
    chart: {
      type: 'bar' as const,
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
      borderRadius: 4,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '50%',
      },
    },
    colors: ['#8b5cf6'], // violet-500
    xaxis: {
      categories: [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
      ],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: '#9ca3af' }, // gray-400
      },
    },
    yaxis: {
      labels: {
        style: { colors: '#9ca3af' }, // gray-400
      },
    },
    grid: {
      borderColor: '#f3f4f6', // gray-100
      strokeDashArray: 4,
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val: number) => `${val} Partisipan`,
      },
    },
  }

  const series = [
    {
      name: 'Partisipasi Ujian',
      data: chartData,
    },
  ]

  return (
    <div className="row">
      {/* Trend Chart */}
      <div className="col-xl-8 col-lg-7 mb-4 mb-lg-0">
        <div className="card border-0 shadow-sm h-100 overflow-hidden d-flex flex-column">
          <div className="card-header bg-white border-bottom p-4 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="bg-info bg-opacity-10 text-info p-2 rounded-3 me-3">
                <BarChart3 size={20} />
              </div>
              <div>
                <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>Partisipasi Ujian</h5>
                <small className="text-muted fw-medium">Statistik pengerjaan per bulan</small>
              </div>
            </div>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="form-select form-select-sm border-0 bg-light fw-semibold text-dark shadow-none w-auto"
              style={{ cursor: 'pointer' }}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  Tahun {y}
                </option>
              ))}
            </select>
          </div>

          <div className="card-body p-0 flex-grow-1 position-relative" style={{ minHeight: '350px' }}>
            <div className="position-absolute top-0 bottom-0 start-0 end-0 p-3 pt-4">
              <Chart
                options={options}
                series={series}
                type="bar"
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Exams */}
      <div className="col-xl-4 col-lg-5">
        <div className="card border-0 shadow-sm h-100 overflow-hidden d-flex flex-column">
          <div className="card-header bg-white border-bottom p-4 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 text-warning p-2 rounded-3 me-3">
                <Trophy size={20} />
              </div>
              <div>
                <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>Top 5 Ujian</h5>
                <small className="text-muted fw-medium">Peserta terbanyak</small>
              </div>
            </div>
          </div>

          <div className="card-body p-4 overflow-auto" style={{ maxHeight: '400px' }}>
            {topExams.length === 0 ? (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted py-5">
                <p className="fw-medium mb-0">Belum ada data ujian</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {topExams.map((exam, index) => {
                  let badgeClass = 'bg-light text-secondary'
                  if (index === 0) badgeClass = 'bg-warning text-white shadow-sm'
                  else if (index === 1) badgeClass = 'bg-secondary text-white shadow-sm'
                  else if (index === 2) badgeClass = 'bg-danger text-white shadow-sm'

                  return (
                    <div key={exam.id} className="border rounded-3 p-3 bg-white hover-bg-light transition-colors d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <div 
                          className={`rounded-2 d-flex align-items-center justify-content-center fw-bold me-3 ${badgeClass}`}
                          style={{ width: '32px', height: '32px', fontSize: '0.875rem' }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <Link 
                            to={`/admin/exam/${exam.id}/detail`}
                            className="fw-bold text-dark text-decoration-none hover-text-primary text-truncate d-block"
                            style={{ maxWidth: '160px', fontSize: '0.875rem' }}
                            title={exam.title}
                          >
                            {exam.title}
                          </Link>
                          <p className="text-muted mt-1 mb-0 fw-medium" style={{ fontSize: '0.75rem' }}>
                            {exam.total_participants} Peserta
                          </p>
                        </div>
                      </div>
                      <Link 
                        to={`/admin/exam/${exam.id}/detail`}
                        className="btn btn-sm btn-light text-muted p-1"
                      >
                        <ChevronRight size={16} strokeWidth={3} />
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
