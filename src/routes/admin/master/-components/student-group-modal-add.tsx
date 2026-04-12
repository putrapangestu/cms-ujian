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
import { useEffect, useState } from 'react'
import {
  studentGroupSchema,
  studentSchema,
  type StudentGroupDataType,
  type StudentGroupType,
  type StudentType,
} from '@/data/validations/student_schema'
import { STUDENT_GROUP } from '@/data/const/api_url'
import { useMutationAction } from '@/data/hooks/api/useGlobalFetch'

type ComponentProps = { isEdit?: boolean; studentGroup?: StudentGroupDataType }

export default function StudentGroupModalCreate({
  isEdit = false,
  studentGroup,
}: ComponentProps) {
  const closeForm = () => {
    if (isEdit && studentGroup) {
      form.reset(studentGroup)
    } else {
      form.reset(defaultValues)
    }
    $('#student-group-modal-create').modal('hide')
  }

  const { trigger: createTrigger, isMutating: isMutatingCreate } =
    useMutationAction(STUDENT_GROUP.CREATE, 'post', {
      refreshKey: STUDENT_GROUP.GET,
      onSuccess: closeForm,
    })
  const { trigger: updateTrigger, isMutating: isMutatingUpdate } =
    useMutationAction(STUDENT_GROUP.UPDATE, 'put', {
      refreshKey: STUDENT_GROUP.GET,
      onSuccess: closeForm,
    })

  const defaultValues: StudentGroupType = {
    name: '',
    description: '',
    max_students: 1,
    status: 'active',
    students_count: 0,
  }

  const form = useForm<StudentGroupType>({
    mode: 'onChange',
    resolver: zodResolver(studentGroupSchema),
    defaultValues,
  })

  const onSubmit = (data: StudentGroupType) => {
    const trigger = isEdit ? updateTrigger : createTrigger
    const dataToSubmit = isEdit ? { id: studentGroup?.id, ...data } : data
    trigger(dataToSubmit)
  }

  useEffect(() => {
    if (!isEdit) form.reset(defaultValues)
    else form.reset(studentGroup)
  }, [isEdit, studentGroup])

  return (
    <div className="modal fade" tabIndex={-1} id="student-group-modal-create">
      <div className="modal-dialog">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="modal-content"
          >
            <div className="modal-header">
              <h5 className="modal-title">
                {isEdit ? 'Ubah' : 'Tambah'} Grup Siswa
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
                name="max_students"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel required>{'Jumlah Maksimal Siswa'}</FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        className="form-control"
                        min={1}
                        onChange={(e) => onChange(Number(e.target.value))}
                        placeholder={'Masukkan jumlah maksimal siswa'}
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
