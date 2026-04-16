import { IconX, IconDownload } from '@tabler/icons-react'
import { useForm } from 'react-hook-form'
import { QUESTION_BANK, QUESTION } from '@/data/const/api_url'
import { useMutationAction } from '@/data/hooks/api/useGlobalFetch'
import { toaster } from '@/lib/toast'
import { getToken } from '@/lib/token-handler'

type ComponentProps = {
  questionGroupId: string
  categoryId?: string
}

export default function ImportExcelModal({
  questionGroupId,
  categoryId,
}: ComponentProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { trigger, isMutating } = useMutationAction(
    QUESTION_BANK.IMPORT_EXCEL,
    'post',
    {
      refreshKey: QUESTION.GET,
      onSuccess: () => {
        toaster('Sukses mengimport soal dari Excel/CSV', 'success')
        closeModal()
      },
      onError: (err: any) => {
        const errorMsg = err?.response?.data?.message || 'Gagal mengimport soal'
        toaster(errorMsg, 'error')
      }
    }
  )

  const closeModal = () => {
    $('#import-excel-modal').modal('hide')
    reset()
  }

  const handleDownloadTemplate = () => {
    const baseUrl = import.meta.env.VITE_API_URL
    const token = getToken()
    
    fetch(`${baseUrl}${QUESTION_BANK.DOWNLOAD_TEMPLATE}`, {
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
        a.download = 'Template_Import_Soal.xlsx'
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
    if (file.size > 10 * 1024 * 1024) { // 10MB limit for excel
      toaster('Ukuran file maksimal 10MB', 'warning')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('question_group_id', questionGroupId)
    if (categoryId) {
      formData.append('category_id', categoryId)
    }

    trigger(formData as any)
  }

  return (
    <div
      className="modal fade"
      id="import-excel-modal"
      tabIndex={-1}
      data-bs-backdrop="static"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">Import dari Excel / CSV</h5>
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
                <p className="mb-2">Sistem mengharapkan minimal 5 kolom dengan susunan spesifik:</p>
                <ul className="mb-0 ps-3">
                  <li><strong>Baris 1 (Header):</strong> Akan diabaikan oleh sistem (bebas dinamai apa saja).</li>
                  <li><strong>Kolom A (Teks Soal):</strong> Wajib diisi.</li>
                  <li><strong>Kolom B (Tipe Soal):</strong> Wajib diisi (<code>multiple_choice</code>, <code>essay</code>, <code>true_false</code>, <code>single_choice</code>).</li>
                  <li><strong>Kolom C (Kategori):</strong> Nama kategori soal (Opsional).</li>
                  <li><strong>Kolom D (Skor):</strong> Nilai dari soal (Opsional, default 1).</li>
                  <li><strong>Kolom E (Jawaban Benar):</strong> Untuk pilihan ganda, harus <strong>sama persis</strong> dengan teks di salah satu opsi jawaban.</li>
                  <li><strong>Kolom F (Grup Soal):</strong> Nama grup soal (Opsional).</li>
                  <li><strong>Kolom G dst (Opsi Jawaban):</strong> Mulai dari Kolom G adalah Opsi A, Kolom H adalah Opsi B, dst.</li>
                </ul>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  File Excel/CSV <span className="text-danger">*</span>
                </label>
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
                {isMutating ? 'Mengimpor...' : 'Import Soal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
