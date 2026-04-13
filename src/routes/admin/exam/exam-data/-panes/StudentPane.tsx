import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { EXAM, QUESTION } from '@/data/const/api_url'
import { useQueryData } from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponsePaginationType } from '@/data/types/api_response'
import type { QuestionDataType } from '@/data/validations/question_schema'
import type { StudentDataType } from '@/data/validations/student_schema'
import { IconSearch } from '@tabler/icons-react'
import { Route, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export function StudentPane({ examId }: { examId: string }) {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data } = useQueryData<ApiResponsePaginationType<any>>(EXAM.USERS, {
    id: examId,
    page: page,
    per_page: 10,
  })
  const columns: ColumnDef<any>[] = [
    { header: '#', cell: (_, i) => i + 1 },
    {
      header: 'Nama',
      cell: (v) => {
        return (
          <div>
            <h6>{v.user.name}</h6>
            <span className="text-muted">{v.user.email}</span>
          </div>
        )
      },
    },
    { header: 'No. HP', accessorKey: 'user.student.phone' },
    { header: 'Asal Sekolah', accessorKey: 'user.student.address' },
    {
      header: 'Grup',
      cell: (v) => (
        <span className="badge bg-info-subtle text-info px-3 py-2">
          {v.user?.student?.group?.name || '-'}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (v) => {
        const status = v.status || 'unknown'
        let badgeClass = 'bg-primary-subtle text-primary'
        if (status.toLowerCase() === 'selesai' || status.toLowerCase() === 'completed') badgeClass = 'bg-success-subtle text-success'
        else if (status.toLowerCase() === 'berlangsung' || status.toLowerCase() === 'in_progress') badgeClass = 'bg-warning-subtle text-warning'
        
        return (
          <span className={`badge ${badgeClass} px-3 py-2 text-capitalize`}>
            {status}
          </span>
        )
      },
    },
    {
      header: 'Skor',
      cell: (v) => (
        <span className="badge bg-success-subtle text-success px-3 py-2">
          {v.score ?? '-'}
        </span>
      ),
    },
  ]
  console.log(data)
  return (
    <>
      <div className="card">
        <div className="border-bottom p-4">
          <h5 className="card-title fw-bolder">Master Siswa</h5>
          <p className="text-muted">Pilih soal yang akan dijawab oleh siswa</p>
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
            data={data?.data || []}
            columns={columns}
            showPageSize={false}
            pageIndex={page || 1}
            rowCount={data?.pagination?.total_items || 0}
            onPageChange={setPage}
            manualPagination
          />
        </div>
      </div>
    </>
  )
}
