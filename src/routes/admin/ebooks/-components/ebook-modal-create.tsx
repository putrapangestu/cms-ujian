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
import { EbookFormSchema } from '@/data/validations/ebook_schema'
import type { EbookDataType } from '@/data/validations/ebook_schema'
import { EBOOK, QUESTION_CATEGORY } from '@/data/const/api_url'
import { useMutationAction, useQueryData } from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponsePaginationType } from '@/data/types/api_response'

type ComponentProps = { isEdit?: boolean; ebook?: EbookDataType }

export default function EbookModalCreate({
  isEdit = false,
  ebook,
}: ComponentProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const closeForm = () => {
    form.reset(defaultValues)
    setSelectedFile(null)
    $('#ebook-modal-create').modal('hide')
  }

  const { trigger: createTrigger, isMutating: isMutatingCreate } =
    useMutationAction(EBOOK.CREATE, 'post', {
      refreshKey: EBOOK.GET,
      onSuccess: closeForm,
    })
  const { trigger: updateTrigger, isMutating: isMutatingUpdate } =
    useMutationAction(EBOOK.UPDATE, 'post', {
      refreshKey: EBOOK.GET,
      onSuccess: closeForm,
    })

  const { data: categoriesData } = useQueryData<
    ApiResponsePaginationType<{ id: string; name: string; code: string }>
  >(QUESTION_CATEGORY.GET, { limit: 999999, page: 1 })

  const optCategories = useMemo(
    () =>
      categoriesData?.data?.data?.map((cat: any) => ({
        value: cat.id,
        label: `${cat.name} (${cat.code})`,
      })) || [],
    [categoriesData],
  )

  const defaultValues = {
    name: '',
    question_category_id: '',
  }

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(EbookFormSchema),
    defaultValues,
  })

  const onSubmit = (data: any) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('question_category_id', data.question_category_id)
    if (selectedFile) {
      formData.append('file', selectedFile)
    }

    if (isEdit) {
      formData.append('_method', 'PUT')
      formData.append('id', String(ebook?.id))
      updateTrigger(formData)
    } else {
      createTrigger(formData)
    }
  }

  useEffect(() => {
    if (!isEdit) {
      form.reset(defaultValues)
      setSelectedFile(null)
    } else {
      form.reset({
        name: ebook?.name || '',
        question_category_id: (ebook as any)?.question_category_id || '',
      })
      setSelectedFile(null)
    }
  }, [isEdit, ebook])

  return (
    <div className="modal fade" tabIndex={-1} id="ebook-modal-create">
      <div className="modal-dialog">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="modal-content"
          >
            <div className="modal-header">
              <h5 className="modal-title">
                {isEdit ? 'Ubah' : 'Tambah'} Ebook
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
                        placeholder={'Masukkan nama ebook'}
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{'Kategori'}</FormLabel>
                    <FormControl>
                      <select className="form-control" {...field}>
                        <option value="">Pilih Kategori</option>
                        {optCategories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mb-3">
                <label className="form-label" htmlFor="file">File Ebook</label>
                <input
                  type="file"
                  className="form-control"
                  id="file"
                  accept=".pdf,.epub,.doc,.docx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setSelectedFile(file)
                    } else {
                      setSelectedFile(null)
                    }
                  }}
                />
                {!isEdit && !selectedFile && (
                  <div className="form-text text-danger mt-1">File wajib diunggah (Maks 10MB)</div>
                )}
                {isEdit && (
                  <div className="form-text mt-1">Kosongkan jika tidak ingin mengubah file (Maks 10MB)</div>
                )}
              </div>
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
                  !form.formState.isValid ||
                  (!isEdit && !selectedFile)
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
