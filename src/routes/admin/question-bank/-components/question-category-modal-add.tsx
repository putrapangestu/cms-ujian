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
import { QUESTION_CATEGORY } from '@/data/const/api_url'
import { useMutationAction } from '@/data/hooks/api/useGlobalFetch'
import {
  questionCategorySchema,
  type QuestionCategoryDataType,
  type QuestionCategoryType,
} from '@/data/validations/question_schema'

type ComponentProps = {
  isEdit?: boolean
  questionCategory?: QuestionCategoryDataType
}

export default function QuestionCategoryModalCreate({
  isEdit = false,
  questionCategory,
}: ComponentProps) {
  const closeForm = () => {
    if (isEdit && questionCategory) {
      form.reset({
        name: questionCategory.name || '',
        description: questionCategory.description || undefined,
        code: questionCategory.code || '',
        status: questionCategory.status || 'active',
        start_range: questionCategory.start_range || 0,
        end_range: questionCategory.end_range || 0,
      })
    } else {
      form.reset(defaultValues)
    }
    $('#question-category-modal-create').modal('hide')
  }

  const { trigger: createTrigger, isMutating: isMutatingCreate } =
    useMutationAction(QUESTION_CATEGORY.CREATE, 'post', {
      refreshKey: QUESTION_CATEGORY.GET,
      onSuccess: closeForm,
    })
  const { trigger: updateTrigger, isMutating: isMutatingUpdate } =
    useMutationAction(QUESTION_CATEGORY.UPDATE, 'put', {
      refreshKey: QUESTION_CATEGORY.GET,
      onSuccess: closeForm,
    })

  const defaultValues: QuestionCategoryType = {
    name: '',
    description: undefined,
    code: '',
    status: 'active',
    start_range: 0,
    end_range: 0,
  }

  const form = useForm<QuestionCategoryType>({
    mode: 'onChange',
    resolver: zodResolver(questionCategorySchema),
    defaultValues,
  })

  const onSubmit = (data: QuestionCategoryType) => {
    const trigger = isEdit ? updateTrigger : createTrigger
    const dataToSubmit = isEdit
      ? { id: questionCategory?.id, ...data }
      : { ...data }
    trigger(dataToSubmit)
  }

  useEffect(() => {
    if (!isEdit) {
      form.reset(defaultValues)
    } else {
      form.reset({
        name: questionCategory?.name || '',
        description: questionCategory?.description || undefined,
        code: questionCategory?.code || '',
        status: questionCategory?.status || 'active',
        start_range: questionCategory?.start_range || 0,
        end_range: questionCategory?.end_range || 0,
      })
    }
  }, [isEdit, questionCategory])

  // console.log({
  //   errors: form.formState.errors,
  //   values: form.getValues(),
  //   isValid: form.formState.isValid,
  //   isDirty: form.formState.isDirty,
  // })

  return (
    <div
      className="modal fade"
      tabIndex={-1}
      id="question-category-modal-create"
    >
      <div className="modal-dialog">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="modal-content"
          >
            <div className="modal-header">
              <h5 className="modal-title">
                {isEdit ? 'Ubah' : 'Tambah'} Kategori Soal
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
              <div className="row">
                <div className="col-6">
                  <FormField
                    control={form.control}
                    name="start_range"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel required>{'Nomor Mulai'}</FormLabel>
                        <FormControl>
                          <input
                            type="number"
                            className="form-control"
                            placeholder={'Masukkan nomor mulai'}
                            {...field}
                            value={value || ''}
                            onChange={(e) => onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-6">
                  <FormField
                    control={form.control}
                    name="end_range"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel required>{'Nomor Selesai'}</FormLabel>
                        <FormControl>
                          <input
                            type="number"
                            className="form-control"
                            placeholder={'Masukkan nomor selesai'}
                            {...field}
                            value={value || ''}
                            onChange={(e) => onChange(Number(e.target.value))}
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
