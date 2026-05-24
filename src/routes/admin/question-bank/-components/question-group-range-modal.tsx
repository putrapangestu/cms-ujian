import { IconSortAscending } from '@tabler/icons-react'
import { QUESTION_GROUP, QUESTION_CATEGORY } from '@/data/const/api_url'
import { useMutationAction, useQueryData } from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponseType } from '@/data/types/api_response'
import type { QuestionGroupDataType } from '@/data/validations/question_schema'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

type ComponentProps = {
  categoryId: string
  categoryName: string
}

type RangeItem = {
  id: string
  name: string
  number_start: number | null
  number_end: number | null
}

export default function QuestionGroupRangeModal({
  categoryId,
  categoryName,
}: ComponentProps) {
  const [ranges, setRanges] = useState<RangeItem[]>([])

  const { data, isLoading, mutate } = useQueryData<
    ApiResponseType<'list', QuestionGroupDataType>
  >(QUESTION_GROUP.GET, {
    question_category_id: categoryId,
    per_page: 100,
    all: true,
  })

  const { trigger, isMutating } = useMutationAction(
    QUESTION_GROUP.UPDATE_RANGE,
    'put',
    {
      refreshKey: QUESTION_GROUP.GET,
      onSuccess: (response: any) => {
        $('#question-group-range-modal').modal('hide')
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: response?.message || 'Range berhasil diperbarui',
          timer: 2000,
        })
      },
      onError: () => {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: 'Terjadi kesalahan saat menyimpan range',
        })
      },
    },
  )

  useEffect(() => {
    if (data?.data) {
      const items = (Array.isArray(data.data) ? data.data : []).map(
        (group) => ({
          id: group.id,
          name: group.name,
          number_start: group.number_start ?? null,
          number_end: group.number_end ?? null,
        }),
      )
      setRanges(items)
    }
  }, [data])

  const handleStartChange = (index: number, value: string) => {
    const updated = [...ranges]
    updated[index] = {
      ...updated[index],
      number_start: value === '' ? null : Number(value),
    }
    setRanges(updated)
  }

  const handleEndChange = (index: number, value: string) => {
    const updated = [...ranges]
    updated[index] = {
      ...updated[index],
      number_end: value === '' ? null : Number(value),
    }
    setRanges(updated)
  }

  const hasErrors = ranges.some((r) => {
    if (r.number_start !== null && r.number_end !== null) {
      return r.number_end < r.number_start
    }
    return false
  })

  const handleSubmit = () => {
    const payload = {
      ranges: ranges.map((r) => ({
        id: r.id,
        number_start: r.number_start,
        number_end: r.number_end,
      })),
    }
    trigger(payload)
  }

  const closeForm = () => {
    $('#question-group-range-modal').modal('hide')
  }

  const sortedRanges = [...ranges].sort((a, b) => {
    const aStart = a.number_start ?? 0
    const bStart = b.number_start ?? 0
    if (aStart !== bStart) return aStart - bStart
    const aEnd = a.number_end ?? 0
    const bEnd = b.number_end ?? 0
    return aEnd - bEnd
  })

  return (
    <div
      className="modal fade"
      tabIndex={-1}
      id="question-group-range-modal"
      data-bs-backdrop="static"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <IconSortAscending
                size={22}
                className="me-2"
                style={{ marginTop: '-4px' }}
              />
              Atur Urutan Soal — {categoryName}
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
            {isLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Memuat...</span>
                </div>
                <p className="mt-2 mb-0 text-muted">Memuat data...</p>
              </div>
            ) : sortedRanges.length === 0 ? (
              <div className="text-center py-4">
                <p className="mb-0 text-muted">
                  Belum ada tipe soal untuk kategori ini.
                </p>
              </div>
            ) : (
              <>
                {hasErrors && (
                  <div className="alert alert-danger py-2 small">
                    Terdapat range yang tidak valid (Nomor Selesai lebih kecil
                    dari Nomor Mulai).
                  </div>
                )}
                <div className="table-responsive">
                  <table className="table table-bordered table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th
                          className="text-center"
                          style={{ width: '50px' }}
                        >
                          No
                        </th>
                        <th>Nama Tipe Soal</th>
                        <th
                          className="text-center"
                          style={{ width: '130px' }}
                        >
                          Nomor Mulai
                        </th>
                        <th
                          className="text-center"
                          style={{ width: '130px' }}
                        >
                          Nomor Selesai
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRanges.map((item, index) => (
                        <tr key={item.id}>
                          <td className="text-center align-middle fw-bold">
                            {index + 1}
                          </td>
                          <td className="align-middle">{item.name}</td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm text-center"
                              min={0}
                              value={item.number_start ?? ''}
                              onChange={(e) =>
                                handleStartChange(index, e.target.value)
                              }
                              placeholder="0"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className={`form-control form-control-sm text-center ${
                                item.number_start !== null &&
                                item.number_end !== null &&
                                item.number_end < item.number_start
                                  ? 'is-invalid'
                                  : ''
                              }`}
                              min={0}
                              value={item.number_end ?? ''}
                              onChange={(e) =>
                                handleEndChange(index, e.target.value)
                              }
                              placeholder="0"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
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
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={
                isMutating || isLoading || sortedRanges.length === 0 || hasErrors
              }
            >
              {isMutating ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-1"
                    role="status"
                  ></span>
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
