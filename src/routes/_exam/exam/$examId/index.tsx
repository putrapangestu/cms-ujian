import { EXAM } from '@/data/const/api_url'
import { useQueryDataPersistent, useMutationAction } from '@/data/hooks/api/useGlobalFetch'
import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/data/store/auth_store'
import type { ApiResponseType } from '@/data/types/api_response'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import { UserSection } from './-components/UserSection'
import { HeaderExam } from './-components/HeaderExam'
import { TimerCard } from './-components/TimerCard'
import { LegendExam } from './-components/LegendExam'
import type { ExamDetailDataType } from '@/data/validations/exam_schema'
import QuestionCard from './-components/QuestionCard'
import styles from './styles/ExamPage.module.css'
import dayjs from 'dayjs'
import { useAnswerStore } from '@/data/store/answer_store'
import Swal from 'sweetalert2'

export const Route = createFileRoute('/_exam/exam/$examId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { examId } = Route.useParams()
  const { user } = useAuthStore()
  const [socket, setSocket] = useState<Socket | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const isSubmitting = useRef(false)
  const submitExamRef = useRef<() => void>()

  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const timeRemainingRef = useRef(timeRemaining)

  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    timeRemainingRef.current = timeRemaining
  }, [timeRemaining])

  const {
    setAnswer,
    toggleDoubtful,
    getAnswer,
    getExamAnswers,
    getAnswerCount,
    hasAnswer,
    setCurrentExam,
    markAsSynced,
    clearExamAnswers,
  } = useAnswerStore()

  useEffect(() => {
    if (examId) {
      clearExamAnswers(examId)
    }
  }, [examId, clearExamAnswers])

  const { data } = useQueryDataPersistent<
    ApiResponseType<'single', ExamDetailDataType>
  >(EXAM.GET_QUESTIONS_USER, { id: examId, userId: user?.id || '' })
  // const answeredQuestions = Object.keys(answers).length;
  // const answeredQuestions = getAnswerCount(examId)
  const answeredQuestions = getExamAnswers(examId).filter(
    (ans) => ans.answer !== '' && ans.answer !== '[]'
  ).length
  const currentQuestionObject = data?.data?.questions?.[currentQuestion - 1]
  const currentAnswer = currentQuestionObject
    ? getAnswer(examId, currentQuestionObject.question_id)
    : undefined

  const { trigger: triggerFinish } = useMutationAction(EXAM.FINISH, 'post', {
    showMessage: false,
    onSuccess: (response) => {
      // Clear answers dari local storage setelah disubmit
      clearExamAnswers(examId)
      // Set local state agar komponen re-render ke tampilan selesai
      console.log("responseFinish", response.data)
      setSummary(response.data)
      setHasSubmitted(true)
    },
    onError: () => {
      Swal.fire('Gagal!', 'Terjadi kesalahan saat mensubmit ujian. Silakan coba lagi.', 'error')
      isSubmitting.current = false
    }
  })

  // 1. Inisialisasi Socket DULU agar saat timer habis, socketRef sudah terisi
  useEffect(() => {
    if (!user?.id || !examId) return

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || 'https://socket-ujian.hummatech.com'

    const newSocket = io(socketUrl, {
      auth: { key: 'Wm9zN2pQeFh3c3RkR1lYcU1vRkR2a2x4V3N3b2xXb1h3eE1nPQ==' },
      query: { userId: user?.id, examId: examId },
    })

    setSocket(newSocket)
    socketRef.current = newSocket

    // Listen perintah dari admin (misal: Force Submit)
    newSocket.on('admin_action', (eventData: any) => {
      if (eventData.action === 'force_submit') {
        Swal.fire({
          title: 'Waktu Habis!',
          text: 'Admin telah menghentikan ujian Anda.',
          icon: 'info',
          confirmButtonText: 'Tutup'
        }).then(() => {
          // Panggil fungsi submit Anda di sini
          if (submitExamRef.current) submitExamRef.current()
        });
      } else if (eventData.action === 'unblock') {
        Swal.fire('Ujian Dibuka', 'Ujian Anda telah dibuka kembali oleh Admin.', 'success');
      }
    })

    newSocket.on('cheat_blocked', () => {
      Swal.fire({
        title: 'Ujian Diblokir',
        text: 'Ujian Anda diblokir karena terdeteksi kecurangan.',
        icon: 'error',
        confirmButtonText: 'Tutup'
      }).then(() => {
        // Panggil fungsi submit/block di sini
        if (submitExamRef.current) submitExamRef.current()
      });
    })

    return () => {
      // Hapus listeners agar tidak double, tapi biarkan socket hidup
      newSocket.off('admin_action')
      newSocket.off('cheat_blocked')
    }
  }, [user, examId])

  // 2. Baru inisialisasi Timer
  useEffect(() => {
    if (!data?.data?.user_exam.start_time || !data?.data?.exam.duration) return

    const startTime = dayjs(data.data.user_exam.start_time)
    const endTime = startTime.add(data.data.exam.duration, 'minute')

    let timer: NodeJS.Timeout

    const updateCountdown = () => {
      const now = dayjs()
      const diff = endTime.diff(now, 'second')

      if (diff <= 0) {
        setTimeRemaining(0)
        if (timer) clearInterval(timer)
        // Check so we don't trigger this multiple times
        if (!isSubmitting.current) {
          handleExamTimeout()
        }
      } else {
        setTimeRemaining(diff)
      }
    }

    // First run immediately
    updateCountdown()

    // Then run every second
    timer = setInterval(updateCountdown, 1000)

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [data])

  const handleExamTimeout = () => {
    // Memastikan tidak muncul pop up berulang kali jika status sedang mensubmit
    if (isSubmitting.current) return
    isSubmitting.current = true

    Swal.fire({
      title: 'Waktu Habis!',
      text: 'Waktu ujian telah habis! Jawaban Anda akan otomatis disubmit.',
      icon: 'info',
      confirmButtonText: 'Mengerti',
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(() => {
      submitExam()
    })
  }

  const submitExam = () => {
    // The alert above might block thread, set flag again to be safe
    isSubmitting.current = true

    // Format answers untuk failsafe di API
    const questions = getExamAnswers(examId).map((ans) => {
      // Karena `ans.questionId` sekarang adalah UUID, kita bisa langsung menggunakannya.
      // Kita hanya perlu mencari tipe soal untuk logika parsing jawaban.
      const questionObject = data?.data?.questions.find(
        (q) => q.question_id === ans.questionId
      )
      const qType = questionObject?.type || questionObject?.question_type || 'single_choice'

      const formattedPayload: any = {
        question_id: ans.questionId, // ✅ ans.questionId sekarang sudah UUID
      }

      if (qType === 'essay') {
        formattedPayload.answer = ans.answer
      } else if (qType === 'multiple_choice') {
        // Handle parsing array jika multiple choice
        formattedPayload.question_option_id =
          typeof ans.answer === 'string' && ans.answer.startsWith('[')
            ? JSON.parse(ans.answer)
            : Array.isArray(ans.answer)
              ? ans.answer
              : ans.answer.split(',').filter(Boolean)
      } else {
        formattedPayload.question_option_id = ans.answer
      }
      return formattedPayload
    })

    // 1. Panggil REST API Finish (Source of Truth untuk kalkulasi)
    triggerFinish({
      id: examId, // Untuk URL replacement {id}
      questions,
    })

    // 2. Tutup socket karena ujian sudah selesai
    if (socketRef.current) {
      socketRef.current.close()
    }
  }

  useEffect(() => {
    submitExamRef.current = submitExam
  }, [submitExam])

  const handleManualSubmit = () => {
    // Check jika ada soal yang belum dijawab
    const totalQuestions = data?.data?.questions.length || 0
    if (answeredQuestions < totalQuestions) {
      Swal.fire({
        title: 'Anda Yakin?',
        text: `Anda baru menjawab ${answeredQuestions} dari ${totalQuestions} soal. Apakah Anda YAKIN ingin mengakhiri ujian sekarang?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Akhiri Ujian',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          submitExam()
        }
      })
    } else {
      Swal.fire({
        title: 'Selesai Mengerjakan?',
        text: 'Apakah Anda yakin ingin mengakhiri ujian? Semua jawaban akan disubmit.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Submit',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          submitExam()
        }
      })
    }
  }

  const handleAnswerSelect = (answer: string) => {
    const questionObject = data?.data?.questions?.[currentQuestion - 1]
    if (!questionObject) return

    // Gunakan question_id (UUID) untuk menyimpan jawaban di store
    setAnswer(examId, questionObject.question_id, answer)

    if (socket) {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)

      const qType = questionObject?.type || questionObject?.question_type || 'single_choice'

      let payloadAnswer: any = null
      let payloadOptionId: any = null

      if (qType === 'essay') {
        payloadAnswer = answer
      } else if (qType === 'multiple_choice') {
        payloadOptionId =
          typeof answer === 'string' && answer.startsWith('[')
            ? JSON.parse(answer)
            : Array.isArray(answer)
              ? answer
              : answer.split(',').filter(Boolean)
      } else {
        payloadOptionId = answer
      }

      const payload: any = {
        exam_id: Number(examId),
        student_id: Number(user?.id),
        user_exam_id: data?.data?.user_exam.id,
        question_id: questionObject.question_id, // ✅ Kirim UUID ke socket
        time_spent: timeSpent,
      }

      if (payloadAnswer !== null) payload.answer = payloadAnswer
      if (payloadOptionId !== null) payload.question_option_id = payloadOptionId

      socket.emit('submit_answer', payload)
      console.log('Jawaban disubmit:', payload)
    }
  }

  const handleNavigate = (questionNumber: number) => {
    setCurrentQuestion(questionNumber)
    setQuestionStartTime(Date.now()) // Reset timer setiap kali ganti soal
  }

  const getQuestionStatus = (num: number) => {
    const questionObject = data?.data?.questions?.[num - 1]
    if (!questionObject) return 'unanswered'

    const questionId = questionObject.question_id
    // const isDoubtful = getAnswer(examId, String(num))?.isDoubtful
    if (num === currentQuestion) return 'active'
    // if (isDoubtful) return 'doubtful'
    const ans = getAnswer(examId, questionId)?.answer
    if (hasAnswer(examId, questionId) && ans !== '' && ans !== '[]') return 'answered'
    return 'unanswered'
  }

  useEffect(() => {
    if (!socket) return

    // Fungsi untuk mengirim data
    const sendPeriodicData = () => {
      const payload = {
        userId: user?.id,
        examId: examId,
        time_remaining: timeRemainingRef.current,
      }

      socket.emit('heartbeat', payload)
      console.log('Heartbeat dikirim:', payload)
    }

    // Set interval setiap 10.000 ms (10 detik)
    const intervalId = setInterval(sendPeriodicData, 10000)

    // CLEANUP: Sangat penting untuk menghapus interval saat komponen unmount
    // atau saat socket berubah/terputus
    return () => {
      clearInterval(intervalId)
      console.log('Interval pengiriman dihentikan.')
    }
  }, [socket, user?.id, examId])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (socket) {
          const payload = {
            userId: user?.id,
            examId: examId,
            warning_type: 'tab_switch',
          }
          socket.emit('cheat_warning', payload)
          console.log('Cheat warning dikirim (pindah tab):', payload)
        }
      }
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setTimeout(() => {
          Swal.fire({
            title: 'Keluar Mode Fullscreen',
            text: 'Anda keluar dari mode Fullscreen! Harap klik area ujian untuk kembali fokus.',
            icon: 'warning',
            confirmButtonText: 'Mengerti'
          });
        }, 100)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [socket, user?.id, examId])

  // useEffect(() => {
  //   const preventShortcuts = (e: KeyboardEvent) => {
  //     if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'u')) {
  //       e.preventDefault();
  //     }
  //   };

  //   window.addEventListener('keydown', preventShortcuts);
  //   return () => window.removeEventListener('keydown', preventShortcuts);
  // }, []);

  if (hasSubmitted) {
    return (
      <div className="container py-4 text-center mt-5">
        <div className="card shadow-sm p-5 mx-auto" style={{ maxWidth: '600px' }}>
          <h3 className="text-success mb-3">Ujian Selesai!</h3>
          <p className="text-muted mb-4">
            Ujian Anda telah berhasil disubmit. Selamat Telah Menyelesaikan Ujian Ini!
          </p>

          {summary && (
            <div className="card my-4">
              <div className="card-header fw-bold">Ringkasan Hasil</div>
              <div className="card-body text-start">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Total Soal
                    <span className="badge bg-primary rounded-pill">{summary?.summary?.total_questions}</span>
                  </li>
                  {/* <li className="list-group-item d-flex justify-content-between align-items-center">
                    Jawaban Diproses
                    <span className="badge bg-info rounded-pill">{summary?.summary?.processed_answers}</span>
                  </li> */}
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Total Dijawab
                    <span className="badge bg-dark rounded-pill">
                      {summary?.summary?.answered_questions}
                    </span>
                  </li>

                  {["twk", "tiu", "tkp"].map((type) => (
                    <li
                      key={type}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      Nilai {type.toUpperCase()}
                      <span className="badge bg-success rounded-pill">
                        {
                          summary?.summary?.category_scores?.find(
                            (item) => item.category_name.toLowerCase() === type
                          )?.total_score || 0
                        }
                      </span>
                    </li>
                  ))}

                  <li className="list-group-item d-flex justify-content-between align-items-center fw-bold">
                    Total Nilai
                    <span className="badge bg-success rounded-pill fs-6">
                      {summary?.summary?.total_score}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          <p className="text-muted">
            Silahkan menunggu Informasi Selanjutnya
          </p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => window.location.href = '/user/exam'}
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="container py-4"
      style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}
    >
      <div className="row g-4">
        {/* Left Section - Question */}
        <div className="col-lg-9 col-xl-9">
          <HeaderExam exam={data?.data?.exam} />
          <QuestionCard
            currentQuestion={currentQuestion}
            questions={data?.data?.questions}
            handleNavigate={handleNavigate}
            handleAnswerSelect={handleAnswerSelect}
            selectedAnswer={currentAnswer?.answer as string}
            totalQuestions={data?.data?.questions.length || 0}
            // isDoubtful={currentAnswer?.isDoubtful || false}
            // onToggleDoubtful={() => toggleDoubtful(examId, String(currentQuestion))}
          />
        </div>

        {/* Right Section - Info & Navigation */}
        <div className="col-lg-3 col-xl-3">
          <UserSection user={data?.data?.user_exam?.user?.student} />
          <TimerCard seconds={timeRemaining} />

          {/* Question Navigator */}
          <div className="card shadow-sm">
            <div
              className="card-header text-center fw-bold py-2"
              style={{
                backgroundColor: '#2c5f5f',
                color: 'white',
                fontSize: '0.95rem',
              }}
            >
              Nomor Soal
            </div>
            <div className="card-body p-3">
              <div className="d-flex flex-wrap gap-2 justify-content-start">
                {Array.from(
                  { length: data?.data?.questions.length || 0 },
                  (_, i) => i + 1,
                ).map((num) => {
                  const status = getQuestionStatus(num)
                  let btnClass = 'btn-outline-secondary'

                  if (status === 'active') {
                    btnClass = 'btn-dark legend-number'
                  // } else if (status === 'doubtful') {
                  //   btnClass = 'btn-warning'
                  } else if (status === 'answered') {
                    btnClass = 'btn-success'
                  }

                  return (
                    <button
                      key={num}
                      className={`btn ${btnClass} ${styles.questionNumberBtn}`} // ✅ Use CSS Module
                      onClick={() => handleNavigate(num)}
                    >
                      {num}
                    </button>
                  )
                })}
              </div>

              <LegendExam />

              <div className="mt-3">
                <button
                  className="btn btn-danger w-100 py-2"
                  style={{ fontSize: '0.9rem' }}
                  onClick={handleManualSubmit}
                >
                  Selesai & Submit ({answeredQuestions}/
                  {data?.data?.questions.length || 0})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}