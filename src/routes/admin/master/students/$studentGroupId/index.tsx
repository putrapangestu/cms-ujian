import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { STUDENT, STUDENT_GROUP } from '@/data/const/api_url'
import { useQueryData } from '@/data/hooks/api/useGlobalFetch'
import type {
  ApiResponsePaginationType,
  ApiResponseType,
} from '@/data/types/api_response'
import type {
  StudentDataType,
  StudentGroupDataType,
} from '@/data/validations/student_schema'
import { IconSearch, IconTrash } from '@tabler/icons-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/admin/master/students/$studentGroupId/')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  const navigate = useNavigate()
  const { studentGroupId } = Route.useParams()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [current, setCurrent] = useState<StudentDataType>()

  const columns: ColumnDef<StudentDataType>[] = [
    { header: '#', cell: (_, i) => i + 1 },
    {
      header: 'Nama',
      cell: (v) => {
        return (
          <div>
            <h6>{v.name}</h6>
            <span className="text-muted">{v.email}</span>
          </div>
        )
      },
    },
    { header: 'No. HP', accessorKey: 'phone' },
    { header: 'Asal Sekolah', accessorKey: 'address' },
    { header: 'Status', accessorKey: 'status' },
  ]

  const { data } = useQueryData<ApiResponsePaginationType<StudentDataType>>(
    STUDENT.GET,
    { group_id: studentGroupId, per_page: 10, page: page },
  )
  const { data: studentGroup } = useQueryData<
    ApiResponseType<'single', StudentGroupDataType>
  >(STUDENT_GROUP.GET_BY_ID, { id: studentGroupId })

  const clickOpenModalHandle = (student?: StudentDataType) => {
    setIsEdit(student ? true : false)
    setCurrent(student)
    $('#student-modal-create').modal('show')
  }

  return (
    <>
      <div className="card">
        <div className="border-bottom p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-1">
              <h5 className="card-title fw-bolder mb-0">{`${studentGroup?.data?.name || ''}`}</h5>
              {studentGroup?.data?.status && (
                <span
                  className={`badge ${
                    studentGroup.data.status === 'active'
                      ? 'bg-success-subtle text-success'
                      : 'bg-danger-subtle text-danger'
                  }`}
                >
                  {studentGroup.data.status === 'active'
                    ? 'Aktif'
                    : 'Tidak Aktif'}
                </span>
              )}
            </div>
            {studentGroup?.data?.description ? (
              <p className="text-muted mb-3">{studentGroup.data.description}</p>
            ) : (
              <p className="text-muted mb-3 fst-italic">Tidak ada deskripsi</p>
            )}
            <div className="d-flex justify-content-start gap-2">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  navigate({
                    to: `/admin/master/students/${studentGroupId}/manage`,
                  })
                }
              >
                Kelola Siswa
              </button>
            </div>
          </div>
          <button
            type="button"
            className="btn bg-light text-dark text-nowrap"
            onClick={() => navigate({ to: '/admin/master/student-group' })}
          >
            Kembali
          </button>
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
