import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { IconEdit, IconEye, IconSearch, IconTrash } from '@tabler/icons-react'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { useState } from 'react'
import { useQueryDataPersistent } from '@/data/hooks/api/useGlobalFetch'
import { EXAM_MONITORING } from '@/data/const/api_url'
import type { ApiResponseType } from '@/data/types/api_response'
import dayjs from 'dayjs'

export const Route = createFileRoute('/admin/exam/exam-monitoring')({
  component: RouteComponent,
})

type ActiveExamDataType = {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  duration: number
  participant_count: number
  status: string
}

function RouteComponent() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data: activeExams, isLoading } = useQueryDataPersistent<
    ApiResponseType<'multi', ActiveExamDataType>
  >(EXAM_MONITORING.ACTIVE)

  const columns: ColumnDef<ActiveExamDataType>[] = [
    { header: '#', cell: (_, i) => i + 1 },
    { header: 'Nama Ujian', accessorKey: 'title' },
    { 
      header: 'Tanggal', 
      cell: (row) => dayjs(row.start_date).format('DD MMM YYYY') 
    },
    { 
      header: 'Waktu', 
      cell: (row) => `${dayjs(row.start_date).format('HH:mm')} - ${dayjs(row.end_date).format('HH:mm')}`
    },
    { 
      header: 'Durasi', 
      cell: (row) => `${row.duration} Menit` 
    },
    { 
      header: 'Peserta', 
      accessorKey: 'participant_count' 
    },
    {
      header: 'Status',
      cell: (row) => {
        return (
          <span className="badge bg-success-subtle text-success">
            {row.status.toUpperCase()}
          </span>
        )
      },
    },
    {
      header: 'Aksi',
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <Link
            to="/admin/exam/exam-monitoring/$examId"
            params={{ examId: row.id }}
            className="btn btn-md px-3 rounded-1 btn-primary d-flex gap-2 align-items-center"
          >
            <IconEye size={18} /> Detail
          </Link>
        </div>
      ),
    },
  ]

  // If we are at the nested route (/$examId), we just want to render the child component.
  // We can use the current path to conditionally render either the list or the outlet
  const isIndex = Route.useMatch().routeId === '/admin/exam/exam-monitoring'

  if (!isIndex) {
    return <Outlet />
  }

  return (
    <div className="card">
      <div className="border-bottom p-4">
        <h5 className="card-title fw-bolder">Monitoring Ujian</h5>
        <p className="p-0">List informasi monitoring ujian</p>
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
        </div>
        <DataTable
          data={activeExams?.data || []}
          columns={columns}
          showPageSize={false}
          pageIndex={page || 1}
          rowCount={activeExams?.data?.length || 0}
          onPageChange={setPage}
          manualPagination
        />
      </div>
    </div>
  )
}
