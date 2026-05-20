import { EXAM } from '@/data/const/api_url'
import { useQueryData } from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponseType } from '@/data/types/api_response'
import type { ExamHistoryDetailDataType } from '@/data/validations/exam_schema'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/user/exam-history/$userExamId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { userExamId } = useParams({ strict: false })

  const { data, isLoading } = useQueryData<
    ApiResponseType<'single', ExamHistoryDetailDataType>
  >(
    EXAM.DETAIL_HISTORY.replace('{id}', userExamId || ''),
    {},
    // ['exam-history-detail', userExamId],
    // !!userExamId,
  )

  const detail = data?.data

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning text-dark'
      case 'in_progress':
        return 'bg-success text-white'
      case 'completed':
        return 'bg-secondary text-white'
      case 'expired':
        return 'bg-danger text-white'
      default:
        return 'bg-light text-dark'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Akan Datang'
      case 'in_progress':
        return 'Sedang Berlangsung'
      case 'completed':
        return 'Selesai'
      case 'expired':
        return 'Kadaluarsa'
      default:
        return 'Unknown'
    }
  }

  const getEffectiveStatus = (status: string, endDate: string | null) => {
    if (status !== 'completed' && endDate && new Date(endDate) < new Date()) {
      return 'expired'
    }
    return status
  }

  if (isLoading) {
    return (
      <div className="container-fluid py-4 d-flex justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">Data riwayat ujian tidak ditemukan.</div>
        <Link to="/user/exam-history" className="btn btn-primary">
          Kembali
        </Link>
      </div>
    )
  }

  console.log(detail.summary?.category_scores)

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div>
          <h4 className="fw-bold mb-2">Detail Riwayat Ujian</h4>
          <p className="text-muted mb-0">Hasil pengerjaan ujian Anda</p>
        </div>
        <Link to="/user/exam-history" className="btn btn-outline-secondary">
          <i className="ti ti-arrow-left me-2"></i>
          Kembali
        </Link>
      </div>

      <div className="row g-4">
        {/* Kolom Kiri: Informasi Ujian & Summary */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">{detail.user_exam?.exam?.title}</h5>
              <div className="mb-3">
                {(() => {
                  const effectiveStatus = getEffectiveStatus(
                    detail.user_exam?.status || '',
                    detail.user_exam?.exam?.end_date || null
                  )
                  return (
                    <span className={`badge ${getStatusBadge(effectiveStatus)}`}>
                      {getStatusText(effectiveStatus)}
                    </span>
                  )
                })()}
              </div>

              <hr className="my-4" />

              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Tanggal Mulai Ujian</span>
                  <span className="fw-semibold">
                    {formatDate(detail.user_exam?.exam?.start_date)} {formatTime(detail.user_exam?.exam?.start_date)}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Tanggal Selesai Ujian</span>
                  <span className="fw-semibold">
                    {formatDate(detail.user_exam?.exam?.end_date)} {formatTime(detail.user_exam?.exam?.end_date)}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Mulai Ujian</span>
                  <span className="fw-semibold">
                    {formatDate(detail.user_exam?.start_time)} {formatTime(detail.user_exam?.start_time)}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Selesai Ujian</span>
                  <span className="fw-semibold">
                    {formatDate(detail.user_exam?.end_time)} {formatTime(detail.user_exam?.end_time)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Ringkasan Nilai</h6>

              <div className="text-center mb-4">
                <div className="display-4 fw-bold text-primary mb-2">
                  {detail.summary?.total_score ?? '-'}
                </div>
                <div className="text-muted">Total Skor</div>
              </div>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Total Soal</span>
                  <span className="badge bg-light text-dark fs-6">{detail.summary?.total_questions}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Soal Dijawab</span>
                  <span className="badge bg-info-subtle text-info fs-6">{detail.summary?.answered_questions}</span>
                </div>
                {Object.entries(detail.summary?.category_scores ?? {}).map(([key, value]) => (
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Nilai {key}</span>
                    <span className="badge bg-light text-dark fs-6">{value}</span>
                  </div>
                ))}
                {/* <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Jawaban Benar</span>
                  <span className="badge bg-success-subtle text-success fs-6">{detail.summary?.correct_answers}</span>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Daftar jawaban user */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Laporan Pengerjaan</h5>

              {detail.user_exam?.user_answers && detail.user_exam.user_answers.length > 0 ? (
                <div className="d-flex flex-column gap-4">
                  {detail.user_exam.user_answers.map((ans, idx) => (
                    <div key={ans.id || idx} className="border rounded p-3">
                      <div className="d-flex align-items-start gap-3">
                        <div className="bg-light rounded px-3 py-2 fw-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-grow-1">
                          <div
                            className="mb-3"
                            dangerouslySetInnerHTML={{
                              __html: ans.question?.question_text || '',
                            }}
                          />

                          {/* Options if available */}
                          {ans.selected_options && ans.selected_options.length > 0 ? (
                            <div className="d-flex flex-column gap-2 mt-3">
                              <strong>Jawaban Anda:</strong>

                              {ans.selected_options.map((opt) => {
                                const badgeClass = opt.is_correct
                                  ? 'bg-success text-white'
                                  : 'bg-danger text-white'

                                return (
                                  <div
                                    key={opt.id}
                                    className={`p-3 rounded border d-flex justify-content-between align-items-start ${
                                      opt.is_correct
                                        ? 'border-success bg-success-subtle'
                                        : 'border-danger bg-danger-subtle'
                                    }`}
                                  >
                                    <div
                                      className="me-3"
                                      dangerouslySetInnerHTML={{
                                        __html: opt.option_text,
                                      }}
                                    />

                                    <div className="d-flex flex-column align-items-end gap-1">
                                      <span className={`badge ${badgeClass}`}>
                                        {opt.is_correct ? 'Benar' : 'Salah'}
                                      </span>

                                      <span className="badge bg-primary">
                                        +{opt.score || 0} Poin
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="mt-3 p-2 border rounded bg-light">
                              <strong>Jawaban Anda:</strong>

                              <p
                                className="text-muted mb-2"
                                dangerouslySetInnerHTML={{
                                  __html: ans?.question_option?.option_text || '-',
                                }}
                              />

                              <div className="d-flex justify-content-between align-items-center">
                                <span
                                  className={`badge ${
                                    ans.is_correct ? 'bg-success' : 'bg-danger'
                                  }`}
                                >
                                  {ans.is_correct ? 'Benar' : 'Salah'}
                                </span>

                                <strong className="text-primary">
                                  {ans.score || 0} Poin
                                </strong>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">
                  <i className="ti ti-info-circle me-2"></i>
                  Data jawaban belum tersedia untuk riwayat ini.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
