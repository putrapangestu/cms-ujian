import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { STUDENT, STUDENT_GROUP } from '@/data/const/api_url'
import { useQueryData } from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponsePaginationType, ApiResponseType } from '@/data/types/api_response'
import type { StudentDataType, StudentGroupDataType } from '@/data/validations/student_schema'
import { IconSearch, IconTrash } from '@tabler/icons-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/admin/master/students/$studentGroupId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const {studentGroupId} = Route.useParams()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [current, setCurrent] = useState<StudentDataType>()

  const columns: ColumnDef<StudentDataType>[] = [
        {header: '#', cell: (_, i) => (i+1)},
        {header: 'Nama', cell: (v) => {
          return <div>
            <h6>{v.name}</h6>
            <span className="text-muted">{v.email}</span>
          </div>
        }},
        {header: 'No. HP', accessorKey: 'phone'},
        {header: 'Asal Sekolah', accessorKey: 'address'},
        {header: 'Status', accessorKey: 'status'},
    ]

  const {data} = useQueryData<ApiResponsePaginationType<StudentDataType>>(STUDENT.GET, {group_id: studentGroupId, per_page: 10, page: page})
  const {data: studentGroup} = useQueryData<ApiResponseType<'single', StudentGroupDataType>>(STUDENT_GROUP.GET_BY_ID, {id: studentGroupId})

  const clickOpenModalHandle = (student?: StudentDataType) => {
        setIsEdit(student ? true : false);
        setCurrent(student);
        $('#student-modal-create').modal('show')
    }

  return (
    <>
    <div className="card">
      <div className="border-bottom p-4">
        <h5 className="card-title fw-bolder">{ `Siswa ${studentGroup?.data?.name || ""}` }</h5>
        <div className='d-flex justify-content-start gap-2'>
            <button type="button" className="btn btn-primary" onClick={() => navigate({to: `/admin/master/students/${studentGroupId}/manage`})}>Kelola Siswa</button>
        </div>
      </div>
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2 mb-3">
             <div className='input-group input-group-sm w-auto'>
                  <DebouncedInput value={search} onChange={(v) => setSearch(String(v))} className='form-control bg-white' placeholder='cari...' />
                  <button type="button" className="btn btn-primary py-2"><IconSearch size={18} /></button>
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
