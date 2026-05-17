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
  useMutationAction,
  useQueryData,
} from '@/data/hooks/api/useGlobalFetch'
import {
  examSchema,
  type ExamDataType,
  type ExamType,
} from '@/data/validations/exam_schema'
import { EXAM, STUDENT_GROUP } from '@/data/const/api_url'
import Select from 'react-select'
import type { ApiResponsePaginationType } from '@/data/types/api_response'
import type { StudentGroupDataType } from '@/data/validations/student_schema'
import { findSelectOption } from '@/lib/select-utils'
import dayjs from 'dayjs'

type ComponentProps = { isEdit?: boolean; exam?: ExamDataType }

export default function ExamModalCreate({
  isEdit = false,
  exam,
}: ComponentProps) {
  const closeForm = () => {
    form.reset(defaultValues)
    $('#exam-modal-create').modal('hide')
  }

  const { trigger: createTrigger, isMutating: isMutatingCreate } =
    useMutationAction(EXAM.CREATE, 'post', {
      refreshKey: EXAM.GET,
      onSuccess: closeForm,
    })
  const { trigger: updateTrigger, isMutating: isMutatingUpdate } =
    useMutationAction(EXAM.UPDATE, 'put', {
      refreshKey: EXAM.GET,
      onSuccess: closeForm,
    })

  const { data: studentGroups, isLoading: studentGroupLoading } = useQueryData<
    ApiResponsePaginationType<StudentGroupDataType>
  >(STUDENT_GROUP.GET, { limit: 999999, page: 1 })
  const studentGroupOptions =
    studentGroups?.data?.map((item) => ({
      value: item.id,
      label: item.name,
    })) || []

  const defaultValues: ExamType = {
    title: '',
    description: undefined,
    duration: 0,
    total_questions: 0,
    passing_score: 0,
    start_date: '',
    end_date: '',
    student_groups: [],
  }

  const form = useForm<ExamType>({
    mode: 'onChange',
    resolver: zodResolver(examSchema),
    defaultValues,
  })

  const onSubmit = (data: ExamType) => {
    const trigger = isEdit ? updateTrigger : createTrigger
    const dataToSubmit = isEdit ? { id: exam?.id, ...data } : { ...data }
    trigger(dataToSubmit)
  }

  console.log(exam)
  useEffect(() => {
    if (!isEdit) form.reset(defaultValues)
    else
      form.reset({
        title: exam?.title || '',
        description: exam?.description || undefined,
        duration: exam?.duration || 0,
        total_questions: exam?.total_questions || 0,
        passing_score: exam?.passing_score || 0,
        start_date: exam
          ? dayjs(exam.start_date).format('YYYY-MM-DDTHH:mm')
          : '',
        end_date: exam
          ? dayjs(exam.end_date).format('YYYY-MM-DDTHH:mm')
          : '',
        student_groups: exam?.student_groups || [],
      })
  }, [isEdit, exam])

  return (
    <div className="modal modal-lg fade" tabIndex={-1} id="exam-modal-create">
      <div className="modal-dialog">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="modal-content"
          >
            <div className="modal-header">
              <h5 className="modal-title">
                {isEdit ? 'Ubah' : 'Tambah'} Ujian
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={closeForm}
              ></button>
            </div>
            <div className="modal-body row">
              <div className="col-12">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{'Judul'}</FormLabel>
                      <FormControl>
                        <input
                          className="form-control"
                          placeholder={'Masukkan judul'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-12">
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
              </div>
              <div className="col-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel required>{'Durasi Ujian'}</FormLabel>
                      <FormControl>
                        <input
                          type="number"
                          className="form-control"
                          onChange={(e) => onChange(Number(e.target.value))}
                          placeholder={'Masukkan durasi ujian'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-4">
                <FormField
                  control={form.control}
                  name="total_questions"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel required>{'Jumlah Soal'}</FormLabel>
                      <FormControl>
                        <input
                          type="number"
                          className="form-control"
                          onChange={(e) => onChange(Number(e.target.value))}
                          placeholder={'Masukkan jumlah soal'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-4">
                <FormField
                  control={form.control}
                  name="passing_score"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel required>{'Nilai Minimum'}</FormLabel>
                      <FormControl>
                        <input
                          type="number"
                          className="form-control"
                          onChange={(e) => onChange(Number(e.target.value))}
                          placeholder={'Masukkan nilai minimum'}
                          {...field}
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
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{'Tanggal Mulai'}</FormLabel>
                      <FormControl>
                        <input
                          type="datetime-local"
                          className="form-control"
                          placeholder={'Masukkan tanggal mulai'}
                          {...field}
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
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{'Tanggal Selesai'}</FormLabel>
                      <FormControl>
                        <input
                          type="datetime-local"
                          className="form-control"
                          placeholder={'Masukkan tanggal selesai'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-12">
                <FormField
                  control={form.control}
                  name="student_groups"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel required={!isEdit}>{'Grup Siswa'}</FormLabel>
                      <FormControl>
                        <Select
                          isMulti={true}
                          styles={{ menu: (base) => ({ ...base, zIndex: 10 }) }}
                          isLoading={studentGroupLoading}
                          onChange={(e) => {
                            const values = e?.map((item) => item.value) || []
                            onChange(values)
                          }}
                          value={studentGroupOptions.filter((item) =>
                            value.includes(item.value),
                          )}
                          options={studentGroupOptions}
                          placeholder="Pilih Grup Siswa"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
