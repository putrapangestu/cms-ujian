import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useState } from 'react'
import type { QuestionCategoryDataType, QuestionDataType } from '@/data/validations/question_schema'
import { QUESTION, QUESTION_CATEGORY } from '@/data/const/api_url'
import { useMutationAction, useQueryData } from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponsePaginationType } from '@/data/types/api_response'
import { deleteDataAlert } from '@/lib/toast'
export const Route = createFileRoute(
  '/admin/question-bank/question-group/$questionGroupId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()
    const { questionGroupId } = Route.useParams()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [current, setCurrent] = useState<QuestionCategoryDataType>()
  
  const {data} = useQueryData<ApiResponsePaginationType<QuestionDataType>>(QUESTION.GET, { group_id: questionGroupId, page: page, per_page: 10 })
  const { trigger: deleteTrigger } = useMutationAction(QUESTION.DELETE, 'delete', { refreshKey: QUESTION.GET })
  
  const clickDeleteHandle = (question: QuestionDataType) => {
        deleteDataAlert("Hapus Soal", () => deleteTrigger({ id: question.id }))
  }

  const columns: ColumnDef<QuestionDataType>[] = [
        {header: '#', cell: (_, i) => (i+1)},
        {header: 'Soal', cell: (v) => {
          return <div dangerouslySetInnerHTML={{ __html: v.question_text }}></div>
        }},
        {header: 'Jenis Soal', accessorKey: 'question_type'},
        {header: 'Skor', accessorKey: 'score'},
        {header: 'Aksi', cell: (v) => (
            <div className='d-flex align-items-center gap-2'>
                <button type="button" className="btn btn-md rounded-1 btn-warning" onClick={() => navigate({to: `/admin/question-bank/question-group/${questionGroupId}/create`, state: {
                  question: v,
                } as any
                })}><IconEdit size={18} /></button>
                <button type="button" className="btn btn-md rounded-1 btn-danger" onClick={() => clickDeleteHandle(v)}><IconTrash size={18} /></button>
            </div>
        )},
    ]

  return (
    <>
    <div className="card">
      <div className="border-bottom p-4">
        <h5 className="card-title fw-bolder">Soal</h5>
        <button type="button" className="btn btn-primary" onClick={() => navigate({to: `/admin/question-bank/question-group/${questionGroupId}/create`})}>Tambah Soal</button>
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
            rowCount={data?.data?.length || 0}
            onPageChange={setPage}
            manualPagination
        />
      </div>
    </div>
    </>
  )
}

