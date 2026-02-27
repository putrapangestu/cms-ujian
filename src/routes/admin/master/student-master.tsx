import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { Icon } from 'lucide-react'
import { useState } from 'react'
import StudentModalCreate from './-components/student-modal-create'
import type { StudentDataType } from '@/data/validations/student_schema'
import { useMutationAction, useQueryData } from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponsePaginationType } from '@/data/types/api_response'
import { STUDENT } from '@/data/const/api_url'
import { deleteDataAlert } from '@/lib/toast'

export const Route = createFileRoute('/admin/master/student-master')({
  component: RouteComponent,
})

function RouteComponent() {

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
        {header: 'Aksi', cell: (v) => (
            <div className='d-flex align-items-center gap-2'>
                <button type="button" className="btn btn-md rounded-1 btn-warning" onClick={() => clickOpenModalHandle(v)}><IconEdit size={18} /></button>
                <button type="button" className="btn btn-md rounded-1 btn-danger" onClick={() => deleteHandle(v)}><IconTrash size={18} /></button>
            </div>
        )},
    ]

    const { trigger: deleteTrigger } = useMutationAction(STUDENT.DELETE, 'delete', { refreshKey: STUDENT.GET })
  const {data} = useQueryData<ApiResponsePaginationType<StudentDataType>>(STUDENT.GET, {per_page: 10, page: page})

  const deleteHandle = (student: StudentDataType) => {
      deleteDataAlert(student.name, () => deleteTrigger({ id: student.id }))
  }

  const clickOpenModalHandle = (student?: StudentDataType) => {
        setIsEdit(student ? true : false);
        setCurrent(student);
        $('#student-modal-create').modal('show')
    }

  return (
    <>
    <StudentModalCreate isEdit={isEdit} student={current} />
    <div className="card">
      <div className="border-bottom p-4">
        <h5 className="card-title fw-bolder">Master Siswa</h5>
        <div className='d-flex justify-content-start gap-2'>
            <button type="button" className='btn btn-primary' onClick={() => clickOpenModalHandle()}>Tambah Siswa</button>
            <button type="button" className='btn btn-warning'>Import Siswa</button>
        </div>
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
            rowCount={data?.pagination?.total_items || 0}
            onPageChange={setPage}
            manualPagination
        />
      </div>
    </div>
    </>
  )
}
