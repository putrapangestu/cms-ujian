import RichEditor from '@/components/RichEditor'
import React from 'react'
import {
  Controller,
  type Control,
  type UseFormRegister,
  type UseFormWatch,
} from 'react-hook-form'

interface ChoiceOptionsProps {
  questionType: string
  fields: any[]
  append: (data: any) => void
  remove: (index: number) => void
  register: UseFormRegister<any>
  watch: UseFormWatch<any>
  control: Control<any>
}

const ChoiceOptions: React.FC<ChoiceOptionsProps> = ({
  questionType,
  fields,
  append,
  remove,
  register,
  watch,
  control,
}) => {
  
  return (
    <div className="mb-5">
      {/* Header Bagian Opsi */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h6 className="fw-semibold mb-1">Opsi Jawaban</h6>
          <p className="text-muted small mb-0">
            Centang {questionType === 'single_choice' ? 'radio' : 'checkbox'}{' '}
            untuk menandai jawaban yang benar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => append({ id: undefined, option_text: '', is_correct: false, score: 0 })}
          className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-1 shadow-sm"
        >
          <i className="ti ti-plus"></i>
          Tambah Opsi
        </button>
      </div>

      {/* Daftar Opsi Dinamis */}
      <div className="d-flex flex-column gap-3">
        {fields.map((item, index) => {
          // Perhatikan: is_correct harus konsisten dengan defaultValues
          const isCorrect = watch(`options.${index}.is_correct`)

          return (
            <div
              key={item.id}
              className={`card border-2 transition-all shadow-sm rounded-3 ${
                isCorrect
                  ? 'border-success bg-success bg-opacity-10'
                  : 'border-light bg-white'
              }`}
            >
              <div className="card-body p-3">
                <div className="d-flex gap-3 align-items-start">
                  {/* Bagian Input Status (Kiri) */}
                  <div className="pt-2">
                    <input
                      type={
                        questionType === 'single_choice' ? 'radio' : 'checkbox'
                      }
                      className={`form-check-input ${isCorrect ? 'bg-success border-success' : ''}`}
                      style={{
                        width: '22px',
                        height: '22px',
                        cursor: 'pointer',
                      }}
                      {...register(`options.${index}.is_correct`)}
                      // Logika radio group: jika single choice, beri name yang sama agar saling toggle
                      name={
                        questionType === 'single_choice'
                          ? 'correctAnswerGroup'
                          : `options.${index}.is_correct`
                      }
                    />
                  </div>

                  {/* Konten Utama (Tengah) */}
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div
                        className={`badge ${isCorrect ? 'bg-success' : 'bg-primary bg-opacity-10 text-primary'} px-3 py-2`}
                      >
                        Opsi {String.fromCharCode(65 + index)}
                      </div>

                      {/* Input Skor */}
                      <div className="d-flex align-items-center gap-2">
                        <label className="small fw-semibold text-muted mb-0">
                          Skor:
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-sm text-center border-2"
                          style={{ width: '70px' }}
                          placeholder="0"
                          {...register(`options.${index}.score`, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    </div>

                    {/* Editor Tiptap */}
                    <div className="bg-white rounded border overflow-hidden">
                      <Controller
                        name={`options.${index}.option_text`}
                        control={control}
                        render={({ field }) => (
                          <RichEditor
                            content={field.value || ''}
                            onChange={field.onChange}
                            placeholder="Ketik opsi jawaban..."
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Tombol Hapus (Kanan) */}
                  {fields.length > 2 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="btn btn-link text-danger p-0 mt-2"
                      title="Hapus opsi"
                    >
                      <i className="ti ti-trash fs-5"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info Panduan */}
      <div
        className="alert alert-info d-flex gap-2 mt-4 border-0 bg-info bg-opacity-10 text-info-emphasis rounded-3"
        role="alert"
      >
        <i className="ti ti-info-circle flex-shrink-0 fs-5 mt-1"></i>
        <div className="small">
          <strong className="d-block mb-1">Panduan Pengisian:</strong>
          {questionType === 'single_choice'
            ? 'Pilih satu opsi sebagai jawaban benar. Jangan lupa isi bobot nilai (skor) pada opsi yang benar (misal: 100).'
            : 'Pilih beberapa jawaban yang benar. Anda bisa membagi bobot nilai (skor) ke beberapa opsi (misal: Opsi A=50, Opsi B=50).'}
        </div>
      </div>
    </div>
  )
}

export default ChoiceOptions
