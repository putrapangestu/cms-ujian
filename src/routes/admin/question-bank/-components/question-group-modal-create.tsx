import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/Form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { IconX } from '@tabler/icons-react'
import {
  studentGroupSchema,
  studentSchema,
  type StudentGroupDataType,
  type StudentGroupType,
  type StudentType,
} from '@/data/validations/student_schema'
import {
  QUESTION_CATEGORY,
  QUESTION_GROUP,
  STUDENT_GROUP,
} from '@/data/const/api_url'
import {
  useMutationAction,
  useQueryData,
} from '@/data/hooks/api/useGlobalFetch'
import {
  questioniGroupSchema,
  type QuestionCategoryDataType,
  type QuestionGroupDataType,
  type QuestionGroupType,
} from '@/data/validations/question_schema'
import type { ApiResponsePaginationType } from '@/data/types/api_response'
import Select from 'react-select'
import { ca } from 'zod/v4/locales'
import { findSelectOption } from '@/lib/select-utils'

type ComponentProps = {
  isEdit?: boolean
  questionGroup?: QuestionGroupDataType
}

export default function QuestionGroupModalCreate({
  isEdit = false,
  questionGroup,
}: ComponentProps) {
  const closeForm = () => {
    if (isEdit && questionGroup) {
      form.reset(questionGroup)
    } else {
      form.reset(defaultValues)
    }
    $('#question-group-modal-create').modal('hide')
  }

  const { data: categories, isLoading: categoryLoading } = useQueryData<
    ApiResponsePaginationType<QuestionCategoryDataType>
  >(QUESTION_CATEGORY.GET, { limit: 999999, page: 1 })
  const optCategories = useMemo(
    () =>
      categories?.data?.map((category: QuestionCategoryDataType) => ({
        value: category.id,
        label: `${category.name} (${category.code})`,
      })) || [],
    [categories],
  )
  const { trigger: createTrigger, isMutating: isMutatingCreate } =
    useMutationAction(QUESTION_GROUP.CREATE, 'post', {
      refreshKey: QUESTION_GROUP.GET,
      onSuccess: closeForm,
    })
  const { trigger: updateTrigger, isMutating: isMutatingUpdate } =
    useMutationAction(QUESTION_GROUP.UPDATE, 'put', {
      refreshKey: QUESTION_GROUP.GET,
      onSuccess: closeForm,
    })

  const defaultValues: QuestionGroupType = {
    name: '',
    description: undefined,
    code: '',
    question_category_id: '',
    status: 'active',
    display_question_count: 0,
    number_start: undefined,
    number_end: undefined,
  }

  const form = useForm<QuestionGroupType>({
    mode: 'onChange',
    resolver: zodResolver(questioniGroupSchema),
    defaultValues,
  })

  const onSubmit = (data: QuestionGroupType) => {
    const trigger = isEdit ? updateTrigger : createTrigger
    const dataToSubmit = isEdit ? { id: questionGroup?.id, ...data } : data
    trigger(dataToSubmit)
  }

  useEffect(() => {
    if (!isEdit) form.reset(defaultValues)
    else form.reset(questionGroup)
  }, [isEdit, questionGroup])

  return (
    <div className="modal fade" tabIndex={-1} id="question-group-modal-create">
      <div className="modal-dialog">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="modal-content"
          >
            <div className="modal-header">
              <h5 className="modal-title">
                {isEdit ? 'Ubah' : 'Tambah'} Grup Soal
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={closeForm}
              ></button>
            </div>
            <div className="modal-body">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{'Nama'}</FormLabel>
                    <FormControl>
                      <input
                        className="form-control"
                        placeholder={'Masukkan nama'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{'Kode'}</FormLabel>
                    <FormControl>
                      <input
                        className="form-control"
                        placeholder={'Masukkan kode'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="question_category_id"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel required>{'Kategori Soal'}</FormLabel>
                    <FormControl>
                      <Select
                        styles={{ menu: (base) => ({ ...base, zIndex: 10 }) }}
                        isLoading={categoryLoading}
                        onChange={(e) => onChange(e?.value)}
                        value={findSelectOption(value, optCategories)}
                        options={optCategories}
                        placeholder="Pilih Kategori Soal"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{'Deskripsi'}</FormLabel>
                    <FormControl>
                      <textarea
                        className="form-control"
                        placeholder={'Masukkan deskripsi'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="display_question_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{'Jumlah Soal Ditampilkan'}</FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        min={0}
                        className="form-control"
                        placeholder={'0'}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <div className="form-text">
                      Berapa soal dari grup ini yang ditampilkan saat ujian. Isi 0 untuk tampilkan semua.
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="row">
                <div className="col-md-6">
                  <FormField
                    control={form.control}
                    name="number_start"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{'No. Mulai'}</FormLabel>
                        <FormControl>
                          <input
                            type="number"
                            className="form-control"
                            placeholder={'Contoh: 1'}
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-md-6">
                  <FormField
                    control={form.control}
                    name="number_end"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{'No. Selesai'}</FormLabel>
                        <FormControl>
                          <input
                            type="number"
                            className="form-control"
                            placeholder={'Contoh: 30'}
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{'Status'}</FormLabel>
                    <FormControl>
                      <select
                        className="form-select"
                        aria-label="Default select example"
                        {...field}
                      >
                        <option value="active">Aktif</option>
                        <option value="inactive">Tidak Aktif</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary-light"
                data-bs-dismiss="modal"
                onClick={closeForm}
              >
                Tutup 
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  isMutatingCreate ||
                  isMutatingUpdate ||
                  !form.formState.isValid
                }
              >
                {isEdit ? 'Ubah' : 'Tambah'}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
