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
import { EXAM, STUDENT, STUDENT_GROUP } from '@/data/const/api_url'
import Select from 'react-select'
import AsyncSelect from 'react-select/async'
import type { ApiResponsePaginationType } from '@/data/types/api_response'
import type { StudentGroupDataType } from '@/data/validations/student_schema'
import { findSelectOption } from '@/lib/select-utils'
import { fetcher } from '@/lib/api-client'
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
  >(STUDENT_GROUP.GET, { per_page: 999999 })
  const studentGroupOptions =
    studentGroups?.data?.map((item) => ({
      value: item.id,
      label: item.name,
    })) || []

  // Options untuk menampilkan student yang sudah terpilih (edit mode)
  const [selectedStudentOptions, setSelectedStudentOptions] = useState<{value: string, label: string}[]>([])

  // Ketika edit, fetch nama student yang sudah terpilih untuk ditampilkan di tag
  useEffect(() => {
    if (isEdit && exam?.students?.length) {
      fetcher.get<ApiResponsePaginationType<{id: string, name: string, nisn: string, group?: {name: string}}>>(
        STUDENT.GET,
        { per_page: 999999, status: 'active' }
      ).then(res => {
        if (res?.data) {
          const selectedSet = new Set(exam.students)
          const opts = res.data
            .filter(s => selectedSet.has(s.id))
            .map(s => ({
              value: s.id,
              label: `${s.name}${s.nisn ? ` (${s.nisn})` : ''}${s.group?.name ? ` - ${s.group.name}` : ''}`
            }))
          setSelectedStudentOptions(opts)
        }
      })
    }
  }, [isEdit, exam])

  // Async search student by name — tidak load semua, search on-demand
  const loadStudentOptions = async (inputValue: string) => {
    if (!inputValue || inputValue.length < 2) return []
    const res = await fetcher.get<ApiResponsePaginationType<{id: string, name: string, nisn: string, group?: {name: string}}>>(
      STUDENT.GET,
      { search: inputValue, per_page: 20, status: 'active' }
    )
    return res?.data?.map(s => ({
      value: s.id,
      label: `${s.name}${s.nisn ? ` (${s.nisn})` : ''}${s.group?.name ? ` - ${s.group.name}` : ''}`
    })) || []
  }

  const defaultValues: ExamType = {
    title: '',
    description: undefined,
    duration: 0,
    total_questions: 0,
    passing_score: 0,
    start_date: '',
    end_date: '',
    student_groups: [],
    students: [],
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

  useEffect(() => {
    if (!isEdit) {
      form.reset(defaultValues)
    } else {
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
        student_groups: Array.isArray(exam?.student_groups)
          ? exam.student_groups.map((sg: any) => (typeof sg === 'string' ? sg : sg?.id))
          : [],
        students: exam?.students || [],
      })
      // Trigger validasi segera agar tombol Ubah tidak disable
      setTimeout(() => form.trigger())
    }
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
              <div className="col-12">
                <FormField
                  control={form.control}
                  name="students"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>{'Pilih Siswa (Opsional)'}</FormLabel>
                      <FormControl>
                        <AsyncSelect
                          isMulti
                          isClearable
                          cacheOptions
                          defaultOptions={isEdit ? selectedStudentOptions : undefined}
                          loadOptions={loadStudentOptions}
                          noOptionsMessage={({ inputValue }) =>
                            inputValue.length < 2
                              ? 'Ketik minimal 2 huruf untuk mencari...'
                              : 'Tidak ada siswa ditemukan'
                          }
                          placeholder="Cari nama siswa..."
                          styles={{ menu: (base) => ({ ...base, zIndex: 10 }) }}
                          onChange={(selected) => {
                            const ids = selected?.map(i => i.value) || []
                            onChange(ids)
                            setSelectedStudentOptions(selected ? [...selected] : [])
                          }}
                          value={selectedStudentOptions.length > 0 ? selectedStudentOptions : null}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-muted small mt-1">
                        * Pilih grup siswa dan/atau siswa secara individu
                      </p>
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
