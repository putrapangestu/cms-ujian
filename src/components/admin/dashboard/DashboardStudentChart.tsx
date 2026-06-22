import { useState } from 'react'
import { DASHBOARD } from '@/data/const/api_url'
import { useQueryData } from '@/data/hooks/api/useGlobalFetch'
import Chart from 'react-apexcharts'
import { TrendingUp } from 'lucide-react'
import { DashboardChartSkeleton } from './DashboardSkeleton'

export default function DashboardStudentChart() {
  const [year, setYear] = useState<number>(new Date().getFullYear())

  const { data, isLoading } = useQueryData<{
    success: boolean
    data: {
      chart_data: { month: number; month_name: string; total: number }[]
    }
  }>(DASHBOARD.CHARTS_STUDENTS, { year })

  if (isLoading && !data) {
    return <DashboardChartSkeleton />
  }

  const rawChartData = data?.data?.chart_data
  const chartData = Array.isArray(rawChartData)
    ? rawChartData.map((d: any) => (typeof d === 'number' ? d : d?.total ?? 0))
    : Array(12).fill(0)

  const options = {
    chart: {
      type: 'area' as const,
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
      dropShadow: {
        enabled: true,
        top: 14,
        left: 0,
        blur: 4,
        opacity: 0.1,
      },
    },
    stroke: {
      curve: 'smooth' as const,
      width: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    colors: ['#3b82f6'], // blue-500
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
        formatter: (val: number) => `${val} Siswa`,
      },
    },
  }

  const series = [
    {
      name: 'Pendaftaran Siswa',
      data: chartData,
    },
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="card border-0 shadow-sm h-100 overflow-hidden d-flex flex-column">
      <div className="card-header bg-white border-bottom p-4 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 me-3">
            <TrendingUp size={20} />
          </div>
          <div>
            <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>Pendaftaran Siswa</h5>
            <small className="text-muted fw-medium">Tren data registrasi per bulan</small>
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
            type="area"
            width="100%"
            height="100%"
          />
        </div>
      </div>
    </div>
  )
}
