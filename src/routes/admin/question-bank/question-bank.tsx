import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/admin/question-bank/question-bank')({
  component: RouteComponent,
})

type QuestionGroupDataType = {
  name: string,
  category: string,
}
function RouteComponent() {

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const data: QuestionGroupDataType[] = [
    {name: 'Ideologi pancasila adalah', category: 'TWK'},
    {name: 'Ideologi pancasila adalah', category: 'TIU'},
  ]

  const columns: ColumnDef<QuestionGroupDataType>[] = [
        {header: '#', cell: (_, i) => (i+1)},
        {header: 'Soal', accessorKey: 'name'},
        {header: 'Kategori', accessorKey: 'name'},
        {header: 'Aksi', cell: (v) => (
            <div className='d-flex align-items-center gap-2'>
                <button type="button" className="btn btn-md px-3 rounded-1 btn-warning"><IconEdit size={18} /></button>
                <button type="button" className="btn btn-md px-3 rounded-1 btn-danger"><IconTrash size={18} /></button>
            </div>
        )},
    ]

  return (
    <div className="card">
      <div className="border-bottom p-4">
        <h5 className="card-title fw-bolder">Master Soal</h5>
        <button type="button" className="btn btn-primary">Tambah Soal</button>
      </div>
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2 mb-3">
             <div className='input-group input-group-sm w-auto'>
                  <DebouncedInput value={search} onChange={(v) => setSearch(String(v))} className='form-control bg-white' placeholder='cari...' />
                  <button type="button" className="btn btn-primary py-2"><IconSearch size={18} /></button>
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