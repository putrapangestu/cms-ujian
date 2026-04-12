import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { IconEdit, IconEye, IconSearch, IconTrash } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/admin/exam/exam-monitoring')({
  component: RouteComponent,
})

type StudentGroupDataType = {
  name: string
  date: string
  startTime: string
  endTime: string
  status: string
}
function RouteComponent() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const data: StudentGroupDataType[] = [
    {
      name: 'Ujian CPNS Batch 1',
      date: '2023-01-01',
      startTime: '08:00',
      endTime: '10:00',
      status: 'Selesai',
    },
  ]

  const columns: ColumnDef<StudentGroupDataType>[] = [
    { header: '#', cell: (_, i) => i + 1 },
    { header: 'Nama Ujian', accessorKey: 'name' },
    { header: 'Tanggal', accessorKey: 'date' },
    { header: 'Waktu Mulai', accessorKey: 'startTime' },
    { header: 'Waktu Selesai', accessorKey: 'endTime' },
    {
      header: 'Status',
      cell(row, index) {
        return (
          <span className="badge bg-success-subtle text-success">
            {row.status}
          </span>
        )
      },
    },
    {
      header: 'Aksi',
      cell: (v) => (
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-md px-3 rounded-1 btn-primary d-flex gap-2 align-items-center"
          >
            <IconEye size={18} /> Detail
          </button>
        </div>
      ),
    },
  ]

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
          data={data}
          columns={columns}
          showPageSize={false}
          pageIndex={page || 1}
          rowCount={data.length}
          onPageChange={setPage}
          manualPagination
        />
      </div>
    </div>
  )
}
