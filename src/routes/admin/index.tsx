import { createFileRoute } from '@tanstack/react-router'
import { LayoutDashboard } from 'lucide-react'
import DashboardSummaryCards from '@/components/admin/dashboard/DashboardSummaryCards'
import DashboardActiveExams from '@/components/admin/dashboard/DashboardActiveExams'
import DashboardStudentChart from '@/components/admin/dashboard/DashboardStudentChart'
import DashboardExamChart from '@/components/admin/dashboard/DashboardExamChart'

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="container-fluid p-4">
      {/* Header Section */}
      <div className="d-flex align-items-center mb-4 pb-2 border-bottom">
        <div className="bg-primary text-white rounded p-2 me-3 shadow-sm d-flex align-items-center justify-content-center">
          <LayoutDashboard size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h4 className="mb-0 fw-bold text-dark">Dashboard Admin</h4>
          <small className="text-muted">
            Ringkasan data operasional dan pantauan aktivitas ujian.
          </small>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Row 1: Summary Cards */}
        <DashboardSummaryCards />

        {/* Row 2: Analytics Charts */}
        <div className="row mb-4">
          <div className="col-xl-8 col-lg-7 mb-4 mb-lg-0">
            <DashboardStudentChart />
          </div>
          <div className="col-xl-4 col-lg-5">
            <DashboardActiveExams />
          </div>
        </div>

        {/* Row 3: Exams Chart & Top Ranking */}
        <DashboardExamChart />
      </div>
    </div>
  )
}
