import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type {
  QuestionDataType,
  QuestionGroupDataType,
} from '@/data/validations/question_schema'
import { QUESTION, QUESTION_GROUP } from '@/data/const/api_url'
import {
  useMutationAction,
  useQueryData,
} from '@/data/hooks/api/useGlobalFetch'
import type {
  ApiResponsePaginationType,
  ApiResponseType,
} from '@/data/types/api_response'
import { deleteDataAlert } from '@/lib/toast'
import ImportExamViewModal from './-components/ImportExamViewModal'
import ImportExcelModal from './-components/ImportExcelModal'

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
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const { data } = useQueryData<ApiResponsePaginationType<QuestionDataType>>(
    QUESTION.GET,
    { question_group_id: questionGroupId, page: page, per_page: 10 },
  )
  const { data: questionGroup } = useQueryData<
    ApiResponseType<'single', QuestionGroupDataType>
  >(QUESTION_GROUP.GET_BY_ID, { id: questionGroupId })

  const { trigger: deleteTrigger } = useMutationAction(
    QUESTION.DELETE,
    'delete',
    { refreshKey: QUESTION.GET },
  )

  const { trigger: bulkDeleteTrigger } = useMutationAction(
    QUESTION.BULK_DELETE,
    'post',
    { refreshKey: QUESTION.GET },
  )

  const clickDeleteHandle = (question: QuestionDataType) => {
    deleteDataAlert('Hapus Soal', () => deleteTrigger({ id: question.id }))
  }

  const handleBulkDelete = () => {
    deleteDataAlert(`${selectedIds.length} Soal Terpilih`, () => {
      bulkDeleteTrigger({ question_ids: selectedIds }).then(() => {
        setSelectedIds([])
      })
    })
  }

  const columns: ColumnDef<QuestionDataType>[] = [
    {
      header: (
        <div className="form-check d-flex justify-content-center">
          <input
            className="form-check-input"
            type="checkbox"
            checked={!!(data?.data && data.data.length > 0 && data.data.every(s => selectedIds.includes(s.id as number)))}
            onChange={(e) => {
              const currentPageIds = data?.data?.map((s) => s.id as number) || []
              if (e.target.checked) {
                setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])))
              } else {
                setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)))
              }
            }}
          />
        </div>
      ),
      cell: (v) => (
        <div className="form-check d-flex justify-content-center">
          <input
            className="form-check-input"
            type="checkbox"
            checked={selectedIds.includes(v.id as number)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedIds((prev) => [...prev, v.id as number])
              } else {
                setSelectedIds((prev) => prev.filter((id) => id !== v.id))
              }
            }}
          />
        </div>
      ),
      width: '5%',
    },
    { header: '#', cell: (_, i) => i + 1 },
    {
      header: 'Soal',
      cell: (v) => {
        return <div dangerouslySetInnerHTML={{ __html: v.question_text }}></div>
      },
    },
    {
      header: 'Jenis Soal',
      cell: (v) => {
        switch (v.question_type) {
          case 'multiple_choice':
          case 'single_choice':
            return 'Pilihan Ganda'
          case 'essay':
            return 'Esai'
          case 'true_false':
            return 'Benar / Salah'
          default:
            return v.question_type
        }
      }
    },
    {
      header: 'Skor',
      cell: (v) => {
        return (
          <span className="badge bg-info-subtle text-info fw-bold">
            {v.score}
          </span>
        )
      }
    },
    {
      header: 'Aksi',
      cell: (v) => (
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-md rounded-1 btn-warning"
            onClick={() =>
              navigate({
                to: `/admin/question-bank/question-group/${questionGroupId}/create`,
                state: {
                  question: v,
                } as any,
              })
            }
          >
            <IconEdit size={18} />
          </button>
          <button
            type="button"
            className="btn btn-md rounded-1 btn-danger"
            onClick={() => clickDeleteHandle(v)}
          >
            <IconTrash size={18} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <ImportExamViewModal
        questionGroupId={questionGroupId}
        categoryId={questionGroup?.data?.question_category_id}
      />
      <ImportExcelModal
        questionGroupId={questionGroupId}
        categoryId={questionGroup?.data?.question_category_id}
      />
      <div className="card">
        <div className="border-bottom p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-1">
              <h5 className="card-title fw-bolder mb-0">
                {questionGroup?.data?.name
                  ? `Grup Soal: ${questionGroup.data.name}`
                  : 'Grup Soal'}
              </h5>
              {questionGroup?.data?.status && (
                <span
                  className={`badge ${questionGroup.data.status === 'active'
                    ? 'bg-success-subtle text-success'
                    : 'bg-danger-subtle text-danger'
                    }`}
                >
                  {questionGroup.data.status === 'active'
                    ? 'Aktif'
                    : 'Tidak Aktif'}
                </span>
              )}
            </div>

            {questionGroup?.data?.question_category && (
              <p className="text-primary fw-semibold mb-1">
                Kategori: {questionGroup.data.question_category.name} (
                {questionGroup.data.question_category.code})
              </p>
            )}

            {questionGroup?.data?.description ? (
              <p className="text-muted mb-3">
                {questionGroup.data.description}
              </p>
            ) : (
              <p className="text-muted mb-3 fst-italic">Tidak ada deskripsi</p>
            )}

            <div className="d-flex justify-content-start gap-2">
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  className="btn btn-danger d-flex align-items-center gap-1"
                  onClick={handleBulkDelete}
                >
                  <IconTrash size={18} /> Hapus Terpilih ({selectedIds.length})
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  navigate({
                    to: `/admin/question-bank/question-group/${questionGroupId}/create`,
                  })
                }
              >
                Tambah Soal
              </button>

              <div className="dropdown">
                <button
                  className="btn btn-outline-primary dropdown-toggle"
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  id="dropdownImportSoal"
                >
                  Import Soal
                </button>
                {showDropdown && (
                  <div
                    className="position-fixed top-0 start-0 w-100 h-100"
                    style={{ zIndex: 1040 }}
                    onClick={() => setShowDropdown(false)}
                  ></div>
                )}
                <ul className={`dropdown-menu ${showDropdown ? 'show' : ''}`} aria-labelledby="dropdownImportSoal" style={{ zIndex: 1050 }}>
                  <li>
                    <button
                      className="dropdown-item"
                      type="button"
                      onClick={() => {
                        setShowDropdown(false)
                          ; (window as any).$('#import-excel-modal').modal('show')
                      }}
                    >
                      Import Excel/CSV
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      type="button"
                      onClick={() => {
                        setShowDropdown(false)
                          ; (window as any).$('#import-examview-modal').modal('show')
                      }}
                    >
                      Import ExamView (ZIP)
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn bg-light text-dark text-nowrap"
            onClick={() =>
              navigate({ to: '/admin/question-bank/question-group' })
            }
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
