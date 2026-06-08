import { DataTable, type ColumnDef } from '@/components/DataTables'
import { DebouncedInput } from '@/components/DebounceInput'
import { EXAM, QUESTION_CATEGORY, QUESTION_GROUP } from '@/data/const/api_url'
import { useQueryData } from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponsePaginationType } from '@/data/types/api_response'
import type {
  QuestionCategoryDataType,
  QuestionDataType,
  QuestionGroupDataType,
} from '@/data/validations/question_schema'
import { IconSearch } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import Select from 'react-select'

export function QuestionPane({ examId }: { examId: string }) {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [questionGroupFilter, setQuestionGroupFilter] = useState<string>('')
  const [questionCategoryFilter, setQuestionCategoryFilter] =
    useState<string>('')

  useEffect(() => {
    setPage(1)
  }, [search])

  // Helper to get option label (A, B, C, D, ...)
  const getOptionLabel = (index: number): string => {
    return String.fromCharCode(65 + index)
  }

  // Helper to get correct answer text from question options
  const getCorrectAnswer = (question: QuestionDataType): string => {
    // For single_choice: find the first option marked as correct (is_correct || score > 0)
    if (question.question_type === 'single_choice') {
      if (!question.options || question.options.length === 0) return '-'
      const correctOption = question.options.find(
        (o) => o.is_correct || o.score > 0,
      )
      if (!correctOption) return '-'
      const idx = question.options.indexOf(correctOption)
      return `(${getOptionLabel(idx)}) ${correctOption.option_text}`
    }

    // For multiple_choice: find all options with is_correct or score > 0
    if (question.question_type === 'multiple_choice') {
      if (!question.options || question.options.length === 0) return '-'
      const correctOptions = question.options.filter(
        (o) => o.is_correct || o.score > 0,
      )
      if (correctOptions.length === 0) return '-'
      return correctOptions
        .map((o) => {
          const idx = question.options.indexOf(o)
          return `(${getOptionLabel(idx)}) ${o.option_text}`
        })
        .join(', ')
    }

    // For essay & true_false: use correct_answer field
    if (question.correct_answer) {
      if (question.question_type === 'true_false') {
        return question.correct_answer === 'true' ? 'Benar' : 'Salah'
      }
      return question.correct_answer
    }

    return '-'
  }

  // Helper for question type translation
  const getQuestionTypeLabel = (type: string | undefined) => {
    switch (type) {
      case 'single_choice':
        return 'Pilihan Ganda'
      case 'multiple_choice':
        return 'Pilihan Ganda Kompleks'
      case 'essay':
        return 'Esai'
      case 'true_false':
        return 'Benar/Salah'
      case 'matching':
        return 'Menjodohkan'
      case 'short_answer':
        return 'Jawaban Singkat'
      default:
        return type || '-'
    }
  }

  // Fetch options for filters
  const { data: groupsData, isLoading: groupsLoading } = useQueryData<
    ApiResponsePaginationType<QuestionGroupDataType>
  >(QUESTION_GROUP.GET, { per_page: 999999 })

  const { data: categoriesData, isLoading: categoriesLoading } = useQueryData<
    ApiResponsePaginationType<QuestionCategoryDataType>
  >(QUESTION_CATEGORY.GET, { per_page: 999999 })

  const groupOptions = useMemo(
    () =>
      groupsData?.data?.map((g) => ({
        value: g.id,
        label: g.name,
      })) || [],
    [groupsData],
  )

  const categoryOptions = useMemo(
    () =>
      categoriesData?.data?.map((c) => ({
        value: c.id,
        label: c.code,
      })) || [],
    [categoriesData],
  )

  const { data, isLoading } = useQueryData<ApiResponsePaginationType<QuestionDataType>>(
    EXAM.QUESTIONS,
    {
      id: examId,
      page: page,
      per_page: 10,
      search: search,
      question_group_id: questionGroupFilter || undefined,
      question_category_id: questionCategoryFilter || undefined,
    },
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
      header: 'Tipe Soal',
      cell: (v) => (
        <span className="badge bg-primary-subtle text-primary px-3 py-2">
          {getQuestionTypeLabel(v.question_type)}
        </span>
      ),
    },
    {
      header: 'Kategori Soal',
      cell: (v) => (
        <span className="badge bg-primary-subtle text-primary px-3 py-2">
          {v.questionGroup?.questionCategory?.code || '-'}
        </span>
      ),
    },
    {
      header: 'Grup Soal',
      cell: (v) => (
        <span className="badge bg-info-subtle text-info px-3 py-2">
          {v.questionGroup?.name || '-'}
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
    {
      header: 'Jawaban Benar',
      cell: (v) => (
        <span className="text-success fw-medium" style={{ fontSize: '0.85rem' }}>
          {getCorrectAnswer(v)}
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
          <div className="d-flex flex-wrap gap-3 mb-3">
            <div className="input-group input-group-sm w-auto" style={{ maxWidth: '250px' }}>
              <DebouncedInput
                value={search}
                onChange={(v) => setSearch(String(v))}
                className="form-control bg-white"
                placeholder="Cari soal..."
              />
              <button type="button" className="btn btn-primary py-2">
                <IconSearch size={18} />
              </button>
            </div>
            
            <div style={{ minWidth: '200px' }}>
              <Select
                options={categoryOptions}
                isLoading={categoriesLoading}
                placeholder="Filter Kategori Soal"
                isClearable
                value={categoryOptions.find((o) => o.value === questionCategoryFilter) || null}
                onChange={(opt) => {
                  setQuestionCategoryFilter(opt ? opt.value : '')
                  setPage(1)
                }}
                styles={{ menu: (base) => ({ ...base, zIndex: 10 }) }}
              />
            </div>

            <div style={{ minWidth: '200px' }}>
              <Select
                options={groupOptions}
                isLoading={groupsLoading}
                placeholder="Filter Grup Soal"
                isClearable
                value={groupOptions.find((o) => o.value === questionGroupFilter) || null}
                onChange={(opt) => {
                  setQuestionGroupFilter(opt ? opt.value : '')
                  setPage(1)
                }}
                styles={{ menu: (base) => ({ ...base, zIndex: 10 }) }}
              />
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
            isLoading={isLoading}
          />
        </div>
      </div>
    </>
  )
}
