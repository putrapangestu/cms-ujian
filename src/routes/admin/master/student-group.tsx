import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { STUDENT_GROUP } from '@/data/const/api_url'
import { useMutationAction, useQueryData } from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponsePaginationType } from '@/data/types/api_response'
import type { StudentGroupDataType } from '@/data/validations/student_schema'
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import StudentGroupModalCreate from './-components/student-group-modal-add'
import { deleteDataAlert } from '@/lib/toast'

export const Route = createFileRoute('/admin/master/student-group')({
  component: RouteComponent,
})
function RouteComponent() {

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [current, setCurrent] = useState<StudentGroupDataType>()

  const { trigger: deleteTrigger } = useMutationAction(STUDENT_GROUP.DELETE, 'delete', { refreshKey: STUDENT_GROUP.GET })

  const clickDeleteHandle = (category: StudentGroupDataType) => {
      deleteDataAlert(category.name, () => deleteTrigger({ id: category.id }))
  }

  const columns: ColumnDef<StudentGroupDataType>[] = [
        {header: '#', cell: (_, i) => (i+1)},
        {header: 'Nama', accessorKey: 'name'},
        {header: 'Total Siswa', cell(row, index) {
          return (
            <span className='badge bg-success-subtle text-success'>{row.max_students}</span>
          )
        },
        },
        {header: 'Aksi', cell: (v) => (
            <div className='d-flex align-items-center gap-2'>
                <button type="button" className="btn btn-md px-3 rounded-1 btn-warning" onClick={() => clickOpenModalHandle(v)}><IconEdit size={18} /></button>
                <button type="button" className="btn btn-md px-3 rounded-1 btn-danger" onClick={() => clickDeleteHandle(v)}><IconTrash size={18} /></button>
            </div>
        )},
    ]
  
    const {data} = useQueryData<ApiResponsePaginationType<StudentGroupDataType>>(STUDENT_GROUP.GET)

    const clickOpenModalHandle = (studentGroup?: StudentGroupDataType) => {
        setIsEdit(studentGroup ? true : false);
        setCurrent(studentGroup);
        $('#student-group-modal-create').modal('show')
    }

  return (
    <>
    <StudentGroupModalCreate isEdit={isEdit} studentGroup={current} />
    <div className="card">
      <div className="border-bottom p-4">
        <h5 className="card-title fw-bolder">Group Siswa</h5>
        <button type="button" className='btn btn-primary' onClick={() => clickOpenModalHandle()}>Tambah Group Siswa</button>
      </div>
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2 mb-3">
             <div className='input-group input-group-sm w-auto'>
                  <DebouncedInput value={search} onChange={(v) => setSearch(String(v))} className='form-control bg-white' placeholder='cari...' />
                  <button type="button" className='btn btn-primary py-2'><IconSearch size={18} /></button>
              </div>
        </div>
        <DataTable
            data={data?.data || []}
            columns={columns}
            showPageSize={false}
            pageIndex={page || 1}
            rowCount={data?.data?.length || 0}
            onPageChange={setPage}
            manualPagination
        />
      </div>
    </div>
    </>
  )
}
