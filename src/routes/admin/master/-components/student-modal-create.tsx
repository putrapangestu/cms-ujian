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
  studentSchema,
  type StudentDataType,
  type StudentType,
} from '@/data/validations/student_schema'
import { STUDENT } from '@/data/const/api_url'
import { useMutationAction } from '@/data/hooks/api/useGlobalFetch'

type ComponentProps = { isEdit?: boolean; student?: StudentDataType }

export default function StudentModalCreate({
  isEdit = false,
  student,
}: ComponentProps) {
  const closeForm = () => {
    form.reset(defaultValues)
    $('#student-modal-create').modal('hide')
  }

  const { trigger: createTrigger, isMutating: isMutatingCreate } =
    useMutationAction(STUDENT.CREATE, 'post', {
      refreshKey: STUDENT.GET,
      onSuccess: closeForm,
    })
  const { trigger: updateTrigger, isMutating: isMutatingUpdate } =
    useMutationAction(STUDENT.UPDATE, 'put', {
      refreshKey: STUDENT.GET,
      onSuccess: closeForm,
    })

  const defaultValues: StudentType = {
    name: '',
    email: '',
    phone: undefined,
    birth_date: '',
    address: undefined,
    status: 'active',
  }

  const form = useForm<StudentType>({
    mode: 'onChange',
    resolver: zodResolver(studentSchema),
    defaultValues,
  })

  const onSubmit = (data: StudentType) => {
    const trigger = isEdit ? updateTrigger : createTrigger
    const dataToSubmit = isEdit ? { id: student?.id, ...data } : data
    trigger(dataToSubmit)
  }

  useEffect(() => {
    if (!isEdit) {
      form.reset(defaultValues)
    } else {
      // If editing, map student and user.email data correctly
      const mappedData: StudentType = {
        name: student?.name || '',
        email: (student as any)?.user?.email || student?.email || '',
        phone: student?.phone || undefined,
        birth_date: student?.birth_date || '',
        address: student?.address || undefined,
        status: student?.status || 'active',
      }
      form.reset(mappedData)
    }
  }, [isEdit, student])

  return (
    <div className="modal fade" tabIndex={-1} id="student-modal-create">
      <div className="modal-dialog">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="modal-content"
          >
            <div className="modal-header">
              <h5 className="modal-title">
                {isEdit ? 'Ubah' : 'Tambah'} Siswa
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{'Email'}</FormLabel>
                    <FormControl>
                      <input
                        type="email"
                        className="form-control"
                        placeholder={'Masukkan email'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{'Tanggal Lahir'}</FormLabel>
                    <FormControl>
                      <input
                        type="date"
                        className="form-control"
                        placeholder={'Masukkan tanggal lahir'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{'No. HP'}</FormLabel>
                    <FormControl>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder={'Masukkan no. hp'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{'Asal Sekolah'}</FormLabel>
                    <FormControl>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={'Masukkan asal sekolah'}
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
                        <option value="graduated">Lulus</option>
                        <option value="dropped">Dikeluarkan</option>
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
