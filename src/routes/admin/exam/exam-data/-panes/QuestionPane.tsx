import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { EXAM, QUESTION } from '@/data/const/api_url'
import { useQueryData } from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponsePaginationType } from '@/data/types/api_response'
import type { QuestionDataType } from '@/data/validations/question_schema'
import { IconSearch } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export function QuestionPane({ examId }: { examId: string }) {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data } = useQueryData<ApiResponsePaginationType<QuestionDataType>>(
    EXAM.QUESTIONS,
    { id: examId, page: page, per_page: 10 },
  )
  const columns: ColumnDef<QuestionDataType>[] = [
    { header: '#', cell: (_, i) => i + 1 },
    {
      header: 'Soal',
      cell: (v) => {
        return <div dangerouslySetInnerHTML={{ __html: v.question_text }}></div>
      },
    },
    {
      header: 'Kategori Soal',
      cell: (v) => (
        <span className="badge bg-primary-subtle text-primary px-3 py-2">
          {v.question_type}
        </span>
      ),
    },
    {
      header: 'Skor',
      cell: (v) => (
        <span className="badge bg-success-subtle text-success px-3 py-2">
          {v.score}
        </span>
      ),
    },
  ]

  return (
    <>
      <div className="card">
        <div className="border-bottom p-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title fw-bolder">Soal Ujian</h5>
              <p className="text-muted">
                Pilih soal yang akan dijawab oleh siswa
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate({
                  to: `/admin/exam/exam-data/$examId/manage-questions`,
                })
              }
            >
              Kelola Soal
            </button>
          </div>
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
            rowCount={data?.data?.length || 0}
            onPageChange={setPage}
            manualPagination
          />
        </div>
      </div>
    </>
  )
}
