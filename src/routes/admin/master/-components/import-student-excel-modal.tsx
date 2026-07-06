import { IconDownload, IconX } from '@tabler/icons-react'
import { useForm, Controller } from 'react-hook-form'
import { STUDENT, STUDENT_GROUP } from '@/data/const/api_url'
import { useMutationAction, useQueryData } from '@/data/hooks/api/useGlobalFetch'
import { errorHtmlAlert, toaster } from '@/lib/toast'
import { getToken } from '@/lib/token-handler'
import type { ApiResponsePaginationType } from '@/data/types/api_response'
import type { StudentGroupDataType } from '@/data/validations/student_schema'
import Select from 'react-select'
import { useMemo } from 'react'

type ComponentProps = {
  preselectedGroupId?: string
}

export default function ImportStudentExcelModal({
  preselectedGroupId,
}: ComponentProps) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm()

  const { data: studentGroupData, isLoading: studentGroupLoading } =
    useQueryData<ApiResponsePaginationType<StudentGroupDataType>>(
      STUDENT_GROUP.GET,
      { per_page: 1000 }, // Ambil semua data untuk dropdown
    )

  const studentGroupOptions = useMemo(() => {
    return (
      studentGroupData?.data?.map((group) => ({
        label: group.name,
        value: group.id,
      })) || []
    )
  }, [studentGroupData])

  const { trigger, isMutating } = useMutationAction(
    STUDENT.IMPORT_EXCEL,
    'post',
    {
      refreshKey: STUDENT.GET,
      onSuccess: (res: any) => {
        const responseData = res?.data
        const hasErrors = responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0
        const totalImported = responseData?.total_imported || 0
        const totalErrors = responseData?.total_errors || 0

        if (hasErrors) {
          const errorList = responseData.errors.map((e: string | any) => {
            return `<li>${typeof e === 'string' ? e : e.message || JSON.stringify(e)}</li>`
          }).join('')
          
          errorHtmlAlert(
            'Import Selesai dengan Catatan',
            `Berhasil import: <b>${totalImported}</b> baris.<br>Gagal import: <b>${totalErrors}</b> baris.<br><br><b>Detail Error:</b><ul class="text-start mt-2 mb-0">${errorList}</ul>`
          )
        } else {
          toaster(`Sukses mengimport ${totalImported || ''} data siswa`, 'success')
        }
        closeModal()
      },
      onError: (err: any) => {
        const errorMsg = err?.response?.data?.message || 'Gagal mengimport data siswa'
        toaster(errorMsg, 'error')
      }
    }
  )

  const closeModal = () => {
    ;(window as any).$('#import-student-excel-modal').modal('hide')
    reset()
  }

  const handleDownloadTemplate = () => {
    const baseUrl = import.meta.env.VITE_API_URL
    const token = getToken()
    
    // Pastikan URL API benar (tanpa /api dua kali jika base url sudah mengandungnya)
    fetch(`${baseUrl}${STUDENT.DOWNLOAD_TEMPLATE}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok')
        return response.blob()
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = 'Template_Import_Siswa.xlsx'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      })
      .catch(error => {
        console.error('Download error:', error)
        toaster('Gagal mengunduh template Excel', 'error')
      })
  }

  const onSubmit = (data: any) => {
    if (!data.file || data.file.length === 0) {
      toaster('Harap pilih file Excel/CSV terlebih dahulu', 'warning')
      return
    }

    const file = data.file[0]
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toaster('Ukuran file maksimal 10MB', 'warning')
      return
    }

    const groupId = preselectedGroupId || data.group_id?.value
    if (!groupId) {
      toaster('Harap pilih Grup Siswa terlebih dahulu', 'warning')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('group_id', groupId)

    trigger(formData as any)
  }

  return (
    <div
      className="modal fade"
      id="import-student-excel-modal"
      tabIndex={-1}
      data-bs-backdrop="static"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">Import Siswa dari Excel / CSV</h5>
            <button
              type="button"
              className="btn text-danger p-0 bg-transparent"
              onClick={closeModal}
              disabled={isMutating}
            >
              <IconX size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-semibold mb-0">Petunjuk Pengisian:</h6>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                  onClick={handleDownloadTemplate}
                >
                  <IconDownload size={16} />
                  Download Template Excel
                </button>
              </div>
              
              <div className="alert alert-secondary py-2 px-3 small mb-4">
                <p className="mb-2">Sistem mengharapkan 4 kolom dengan susunan spesifik:</p>
                <ol className="mb-0 ps-3">
                  <li><strong>Nama Lengkap</strong> (Wajib)</li>
                  <li><strong>Tanggal Lahir</strong> (Wajib, format: DD-MM-YYYY atau DD/MM/YYYY)</li>
                  <li><strong>Asal Sekolah</strong> (Wajib)</li>
                  <li><strong>No Telp</strong> (Opsional)</li>
                </ol>
                <div className="mt-2 pt-2 border-top border-secondary">
                  <strong>Catatan:</strong> Email, Password, dan NISN akan digenerate secara otomatis oleh sistem. Password diambil dari Tanggal Lahir (DDMMYYYY). Asal sekolah akan disimpan ke dalam data alamat.
                </div>
              </div>

              {!preselectedGroupId && (
                <div className="mb-3">
                  <label className="form-label fw-semibold">Pilih Grup Siswa <span className="text-danger">*</span></label>
                  <Controller
                    name="group_id"
                    control={control}
                    rules={{ required: 'Grup siswa wajib dipilih' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        isLoading={studentGroupLoading}
                        options={studentGroupOptions}
                        placeholder="Pilih grup..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                        isDisabled={isMutating}
                      />
                    )}
                  />
                  {errors.group_id && (
                    <span className="text-danger small">{errors.group_id.message as string}</span>
                  )}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-semibold">Upload File <span className="text-danger">*</span></label>
                <input
                  type="file"
                  className="form-control"
                  accept=".xlsx,.xls,.csv"
                  {...register('file', { required: 'File Excel/CSV wajib diunggah' })}
                  disabled={isMutating}
                />
                {errors.file && (
                  <span className="text-danger small">{errors.file.message as string}</span>
                )}
                <div className="form-text">Format yang didukung: .xlsx, .xls, .csv (Maks: 10MB)</div>
              </div>
            </div>
            <div className="modal-footer border-top">
              <button
                type="button"
                className="btn bg-light text-dark"
                onClick={closeModal}
                disabled={isMutating}
              >
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={isMutating}>
                {isMutating ? 'Mengimpor...' : 'Import Siswa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}