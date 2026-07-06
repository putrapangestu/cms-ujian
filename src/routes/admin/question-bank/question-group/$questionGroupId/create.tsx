// routes/admin/question-bank/question-group/$questionGroupId/create.tsx
import RichEditor from '@/components/RichEditor'
import { QUESTION, QUESTION_GROUP } from '@/data/const/api_url'
import {
  useMutationAction,
  useQueryData,
} from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponseType } from '@/data/types/api_response'
import {
  questionSchema,
  type QuestionGroupDataType,
  type QuestionType,
} from '@/data/validations/question_schema'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createFileRoute,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import TrueFalseAnswer from './-components/TrueFalseAnswer'
import EssayAnswer from './-components/EssayAnswer'
import ChoiceOptions from './-components/ChoiceOption'
import { useEffect } from 'react'
import { toaster } from '@/lib/toast'

export const Route = createFileRoute(
  '/admin/question-bank/question-group/$questionGroupId/create',
)({
  component: RouteComponent,
})

// Fungsi bantuan untuk menerjemahkan pesan error bawaan Zod ke Bahasa Indonesia
const translateErrorMsg = (msg: string) => {
  if (!msg) return 'Wajib diisi';
  const lowerMsg = msg.toLowerCase();
  if (lowerMsg === 'required') return 'Wajib diisi';
  if (lowerMsg.includes('expected') || lowerMsg.includes('invalid type')) return 'Format tidak valid';
  if (lowerMsg.includes('string must contain at least')) {
    const match = msg.match(/\d+/);
    const min = match ? match[0] : '1';
    return `Minimal harus diisi ${min} karakter`;
  }
  if (lowerMsg.includes('too small')) return 'Karakter terlalu pendek atau belum diisi';
  return msg;
}

function RouteComponent() {
  const navigate = useNavigate()
  const { questionGroupId } = Route.useParams()
  const location = useLocation()
  const question = location.state?.question

  const defaultValues: QuestionType = {
    question_type: 'single_choice',
    question_text: '',
    options: [
      { id: undefined, option_text: '', is_correct: false, score: 0 },
      { id: undefined, option_text: '', is_correct: false, score: 0 },
    ],
    score: 0,
    trueFalseAnswer: undefined,
    correct_answer: '',
  }

  const {
    control,
    register,
    watch,
    handleSubmit,
    formState,
    setValue,
    getValues,
    reset,
  } = useForm<QuestionType>({
    mode: 'onChange',
    resolver: zodResolver(questionSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'options' })
  const questionType = watch('question_type')

  const { data: questionGroup } = useQueryData<
    ApiResponseType<'single', QuestionGroupDataType>
  >(QUESTION_GROUP.GET_BY_ID, { id: questionGroupId })
  const { trigger: createTrigger, isMutating: isMutatingCreate } = useMutationAction(QUESTION.CREATE, 'post', {
    refreshKey: QUESTION.GET,
    onSuccess: () => navigate({
      to: `/admin/question-bank/question-group/${questionGroupId}`,
    }),
  })
  
  const { trigger: updateTrigger, isMutating: isMutatingUpdate } = useMutationAction(QUESTION.UPDATE, 'put', {
    refreshKey: QUESTION.GET,
    onSuccess: () => navigate({
      to: `/admin/question-bank/question-group/${questionGroupId}`,
    }),
  })

  const isMutating = isMutatingCreate || isMutatingUpdate

  const onSubmit = (data: QuestionType) => {
    console.log("masuk ga sih")
    const dataToSubmit = {
      ...data,
      id: question?.id,
      question_group_id: questionGroupId,
      category_id: questionGroup?.data?.question_category_id,
    }
    
    if (question && question.id) {
      updateTrigger(dataToSubmit)
    } else {
      createTrigger(dataToSubmit)
    }
  }

  useEffect(() => {
    console.log(question)
    if (!question) reset(defaultValues)
    else
      reset({
        question_type: question?.question_type || 'single_choice',
        question_text: question?.question_text || '',
        options: question?.options || [],
        score: question?.score || 0,
        trueFalseAnswer: question?.trueFalseAnswer || undefined,
        correct_answer: question?.correct_answer || '',
      })
  }, [])

  return (
    <div className="">
      <div className="row justify-content-center">
        <div className="col-12">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="#" className="text-decoration-none">
                  Bank Soal
                </a>
              </li>
              <li className="breadcrumb-item">
                <a href="#" className="text-decoration-none">
                  Grup Matematika
                </a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Buat Soal
              </li>
            </ol>
          </nav>

          {/* Main Card */}
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            {/* Header */}
            <div className="card-header bg-white border-bottom py-4 d-flex justify-content-between align-items-center sticky-top">
              <h1 className="h5 mb-0 fw-semibold">Buat Soal Baru</h1>
              <span className="badge bg-light text-dark border">
                <span
                  className="badge bg-secondary rounded-circle me-1"
                  style={{ width: '6px', height: '6px' }}
                ></span>
                Draft
              </span>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit, (errors) => {
                console.log('Form validation errors:', errors)
                const firstErrorKey = Object.keys(errors)[0] as keyof QuestionType;
                if (firstErrorKey) {
                  const errorObj = errors[firstErrorKey] as any;
                  let message = "Terdapat kesalahan pada form";
                  if (errorObj?.message) {
                    message = translateErrorMsg(errorObj.message);
                  } else if (Array.isArray(errorObj) && errorObj.length > 0) {
                     const firstArrError = errorObj.find(e => e !== undefined);
                     if (firstArrError) {
                        const innerKey = Object.keys(firstArrError)[0];
                        if (firstArrError[innerKey]?.message) {
                           message = `Opsi: ${translateErrorMsg(firstArrError[innerKey].message)}`;
                        }
                     }
                  } else if (typeof errorObj === 'object' && Object.keys(errorObj).length > 0) {
                     const innerKey = Object.keys(errorObj)[0];
                     if (errorObj[innerKey]?.message) {
                        message = translateErrorMsg(errorObj[innerKey].message);
                     }
                  }
                  toaster(message, 'error')
                } else {
                  toaster('Pastikan semua field terisi dengan benar', 'error')
                }
              })}
              className="card-body p-4 p-md-5"
            >
              {/* Question Type */}
              <div className="mb-5 row">
                <div className="col-md-8">
                  <label
                    htmlFor="questionType"
                    className="form-label fw-semibold"
                  >
                    Tipe Pertanyaan
                  </label>
                  <select
                    {...register('question_type')}
                    id="questionType"
                    className="form-select form-select"
                  >
                    <option value="single_choice">
                      Pilihan Ganda (Satu Jawaban)
                    </option>
                    <option value="multiple_choice">
                      Pilihan Ganda (Banyak Jawaban)
                    </option>
                    <option value="true_false">
                      Benar / Salah
                    </option>
                    <option value="essay">
                      Essay / Uraian
                    </option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="score" className="form-label fw-semibold">
                    Skor
                  </label>
                  <input
                    id="score"
                    type="number"
                    className="form-control"
                    placeholder="Masukkan skor"
                    // Gunakan valueAsNumber agar otomatis jadi tipe data Number
                    {...register('score', { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Question Editor */}
              <div className="mb-5">
                <label className="form-label fw-semibold">Pertanyaan</label>
                <Controller
                  name="question_text"
                  control={control}
                  render={({ field }) => (
                    <RichEditor
                      content={field.value}
                      onChange={field.onChange}
                      placeholder="Tuliskan pertanyaan lengkap di sini..."
                    />
                  )}
                />
              </div>

              <hr className="my-5" />

              {/* Options - Single/Multiple Choice */}
              {(questionType === 'single_choice' ||
                questionType === 'multiple_choice') && (
                <ChoiceOptions
                  questionType={questionType}
                  fields={fields}
                  append={append}
                  remove={remove}
                  register={register}
                  watch={watch}
                  control={control}
                  setValue={setValue}
                />
              )}

              {/* True/False */}
              {questionType === 'true_false' && (
                <TrueFalseAnswer
                  register={register}
                  watch={watch}
                  name="trueFalseAnswer"
                />
              )}

              {/* Essay */}
              {questionType === 'essay' && (
                <EssayAnswer control={control} name="correct_answer" />
              )}

              {/* Actions */}
              <div className="pt-4 border-top d-flex gap-3 justify-content-end">
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: `/admin/question-bank/question-group/${questionGroupId}`,
                    })
                  }
                  className="btn btn-light px-4"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-5"
                  disabled={isMutating}
                >
                  <i className="ti ti-device-floppy me-2"></i>
                  Simpan Pertanyaan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
