import { IconX } from '@tabler/icons-react'
import { useForm } from 'react-hook-form'
import { QUESTION_BANK, QUESTION } from '@/data/const/api_url'
import { useMutationAction } from '@/data/hooks/api/useGlobalFetch'
import { toaster } from '@/lib/toast'

type ComponentProps = {
  questionGroupId: string
  categoryId?: string
}

export default function ImportExamViewModal({
  questionGroupId,
  categoryId,
}: ComponentProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { trigger, isMutating } = useMutationAction(
    QUESTION_BANK.IMPORT_EXAMVIEW,
    'post',
    {
      refreshKey: QUESTION.GET,
      onSuccess: () => {
        toaster('Sukses mengimport soal dari ExamView', 'success')
        closeModal()
      },
      onError: (err: any) => {
        const errorMsg = err?.response?.data?.message || 'Gagal mengimport soal'
        toaster(errorMsg, 'error')
      }
    }
  )

  const closeModal = () => {
    $('#import-examview-modal').modal('hide')
    reset()
  }

  const onSubmit = (data: any) => {
    if (!data.file || data.file.length === 0) {
      toaster('Harap pilih file ZIP terlebih dahulu', 'warning')
      return
    }

    const file = data.file[0]
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toaster('Ukuran file maksimal 50MB', 'warning')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('question_group_id', questionGroupId)
    if (categoryId) {
      formData.append('category_id', categoryId)
    }

    // Call API using trigger with FormData
    trigger(formData as any)
  }

  return (
    <div
      className="modal fade"
      id="import-examview-modal"
      tabIndex={-1}
      data-bs-backdrop="static"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">Import dari ExamView (ZIP)</h5>
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
              <div className="alert alert-info py-2 px-3 small mb-4">
                <h6 className="fw-bold mb-2">Panduan Export dari ExamView:</h6>
                <ol className="mb-0 ps-3">
                  <li>Buka aplikasi <strong>ExamView Test Generator</strong>.</li>
                  <li>Buat soal-soal seperti biasa (bisa tambahkan gambar, rumus, dll).</li>
                  <li>Klik menu <strong>File &gt; Export &gt; pilih Blackboard 7.1-9.0...</strong></li>
                  <li>ExamView akan meminta Name dan Directory Name (Isi bebas saja).</li>
                  <li>Hasil akhirnya adalah sebuah file <strong>.zip</strong> (misal: <em>Soal_CPNS_TIU.zip</em>).</li>
                  <li>File <strong>.zip</strong> itulah yang langsung di-upload ke sini tanpa perlu diekstrak.</li>
                </ol>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  File ZIP ExamView <span className="text-danger">*</span>
                </label>
                <input
                  type="file"
                  className="form-control"
                  accept=".zip"
                  {...register('file', { required: 'File ZIP wajib diunggah' })}
                  disabled={isMutating}
                />
                {errors.file && (
                  <span className="text-danger small">{errors.file.message as string}</span>
                )}
                <div className="form-text">Maksimal ukuran file: 50MB</div>
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
