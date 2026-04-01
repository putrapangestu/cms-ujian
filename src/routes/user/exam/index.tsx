import { EXAM } from '@/data/const/api_url'
import { useMutationAction, useQueryData } from '@/data/hooks/api/useGlobalFetch'
import type { ApiResponsePaginationType } from '@/data/types/api_response'
import type { ExamDataType, ExamTodayDataType } from '@/data/validations/exam_schema'
import { confirmAlert } from '@/lib/toast'
import { enableFullscreen } from '@/lib/utils'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

export const Route = createFileRoute('/user/exam/')({
  component: RouteComponent,
})

function RouteComponent() {
 
  const navigate = useNavigate()

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateString: string) => {
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
      default:
        return 'Unknown'
    }
  }

  const checkExamStatus = (exam: ExamDataType) => {
    const now = new Date()
    const startDate = new Date(exam.exam.start_date)
    const endDate = new Date(exam.exam.end_date)

    if (now < startDate) {
      return 'pending'
    } else if (now >= startDate && now <= endDate) {
      return 'in_progress'
    } else {
      return 'completed'
    }
  }

  const {data} = useQueryData<ApiResponsePaginationType<ExamTodayDataType>>(EXAM.TODAY, {
    page: 1,
    per_page: 999999,
  })

  const { trigger } = useMutationAction(EXAM.START, 'post')

  const startExam = (exam: any) => {
    confirmAlert('Konfirmasi', () => exam.status === "pending" ? trigger({id: exam.exam_id}) : null, `Apakah Anda yakin ingin mulai ujian?`, () => {
      navigate({to: `/exam/${exam.exam_id}`})
      // enableFullscreen()
    })
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-2">Ujian Hari Ini</h4>
        <p className="text-muted mb-0">
          <i className="ti ti-calendar me-2"></i>
          {formatDate(new Date().toISOString())}
        </p>
      </div>

      {/* Exam Cards */}
      <div className="row g-4">
        {data?.data?.today?.length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <i className="ti ti-calendar-off text-muted" style={{ fontSize: '64px' }}></i>
                <h5 className="mt-3 text-muted">Tidak ada ujian hari ini</h5>
                <p className="text-muted mb-0">Silakan cek jadwal ujian Anda</p>
              </div>
            </div>
          </div>
        ) : (
          data?.data?.today?.map((exam) => (
            <div key={exam.id} className="col-12">
              <div className="card border-0 shadow-sm hover-shadow-lg transition-all">
                <div className="card-body p-4">
                  <div className="row g-4">
                    {/* Left Section - Main Info */}
                    <div className="col-lg-8">
                      {/* Header */}
                      <div className="d-flex align-items-start justify-content-between mb-3">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span className={`badge ${getStatusBadge(checkExamStatus(exam))} rounded-pill px-3 py-2`}>
                              {getStatusText(checkExamStatus(exam))}
                            </span>
                          </div>
                          <h5 className="fw-bold mb-2">{exam.exam.title}</h5>
                          <p className="text-muted mb-0 small">{exam.exam.description}</p>
                        </div>
                      </div>

                      {/* Time Info */}
                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center gap-2">
                            <div className="bg-primary bg-opacity-10 rounded-2 p-2">
                              <i className="ti ti-clock text-primary"></i>
                            </div>
                            <div>
                              <small className="text-muted d-block">Waktu Mulai</small>
                              <strong className="d-block">{formatTime(exam.exam.start_date)}</strong>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex align-items-center gap-2">
                            <div className="bg-danger bg-opacity-10 rounded-2 p-2">
                              <i className="ti ti-clock-stop text-danger"></i>
                            </div>
                            <div>
                              <small className="text-muted d-block">Waktu Selesai</small>
                              <strong className="d-block">{formatTime(exam.exam.end_date)}</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="row g-3">
                        <div className="col-sm-4">
                          <div className="border border-light rounded-3 p-3 text-center">
                            <i className="ti ti-file-text text-primary fs-4 mb-2"></i>
                            <div className="fw-bold">{exam.exam.total_questions}</div>
                            <small className="text-muted">Jumlah Soal</small>
                          </div>
                        </div>
                        <div className="col-sm-4">
                          <div className="border border-light rounded-3 p-3 text-center">
                            <i className="ti ti-target text-success fs-4 mb-2"></i>
                            <div className="fw-bold">{exam.exam.passing_score}</div>
                            <small className="text-muted">Nilai Minimum</small>
                          </div>
                        </div>
                        <div className="col-sm-4">
                          <div className="border border-light rounded-3 p-3 text-center">
                            <i className="ti ti-hourglass text-warning fs-4 mb-2"></i>
                            <div className="fw-bold">{exam.exam.duration} mnt</div>
                            <small className="text-muted">Durasi</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="col-lg-4">
                      <div className="border-start border-light ps-4 h-100 d-flex flex-column justify-content-between">
                        {/* Progress */}

                        {/* Action Buttons */}
                        <div className="d-grid gap-2">
                          {checkExamStatus(exam) === 'in_progress' ? (
                            <>
                              <button className="btn btn-success btn-lg fw-semibold" onClick={() => {
                                startExam(exam)
                              }}>
                                <i className="ti ti-player-play me-2"></i>
                                Mulai Ujian
                              </button>
                            </>
                          ) : checkExamStatus(exam) === 'pending' ? (
                            <>
                              <button className="btn btn-success btn-lg fw-semibold" disabled>
                                <i className="ti ti-player-play me-2"></i>
                                Mulai Ujian
                              </button>
                              <small className="text-muted">Note: Tunggu waktu ujian dimulai</small>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-secondary btn-lg fw-semibold" disabled>
                                <i className="ti ti-check me-2"></i>
                                Ujian Selesai
                              </button>
                              <button className="btn btn-outline-secondary">
                                <i className="ti ti-chart-bar me-2"></i>
                                Lihat Hasil
                              </button>
                            </>
                          )}
                        </div>

                        {/* Additional Info */}
                        <div className="mt-4 p-3 bg-light bg-opacity-50 rounded-3">
                          <small className="text-muted d-block mb-2">
                            <i className="ti ti-info-circle me-1"></i>
                            Tips Ujian
                          </small>
                          <small className="text-muted">
                            Pastikan koneksi internet stabil dan kerjakan soal dengan teliti.
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}