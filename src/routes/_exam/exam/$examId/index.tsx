import { EXAM } from '@/data/const/api_url'
import { useQueryDataPersistent } from '@/data/hooks/api/useGlobalFetch'
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

  const { data } = useQueryDataPersistent<
    ApiResponseType<'single', ExamDetailDataType>
  >(EXAM.GET_QUESTIONS_USER, { id: examId, userId: user?.id || '' })
  // const answeredQuestions = Object.keys(answers).length;
  const answeredQuestions = getAnswerCount(examId)
  const currentAnswer = getAnswer(examId, String(currentQuestion))

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
        handleExamTimeout()
        if (timer) clearInterval(timer)
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
    alert('Waktu ujian telah habis! Jawaban Anda akan otomatis disubmit.')
    submitExam()
  }

  const submitExam = () => {
    if (isSubmitting.current) return
    isSubmitting.current = true

    if (socketRef.current) {
      const payload = {
        exam_id: Number(examId),
        student_id: Number(user?.id),
        user_exam_id: data?.data?.user_exam?.id,
      }
      socketRef.current.emit('finish_exam', payload)
      console.log('Ujian disubmit (finish_exam):', payload)
    }
    
    // Redirect to home or exam list
    window.location.href = '/user/exam'
  }

  useEffect(() => {
    submitExamRef.current = submitExam
  }, [submitExam])

  const handleManualSubmit = () => {
    // Check jika ada soal yang belum dijawab
    const totalQuestions = data?.data?.questions.length || 0
    if (answeredQuestions < totalQuestions) {
      if (!window.confirm(`Anda baru menjawab ${answeredQuestions} dari ${totalQuestions} soal. Apakah Anda YAKIN ingin mengakhiri ujian sekarang?`)) {
        return
      }
    } else {
      if (!window.confirm('Apakah Anda yakin ingin mengakhiri ujian? Semua jawaban akan disubmit.')) {
        return
      }
    }
    submitExam()
  }

  const handleAnswerSelect = (answer: string) => {
    setAnswer(examId, String(currentQuestion), answer)

    if (socket) {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)

      const payload = {
        exam_id: Number(examId),
        student_id: Number(user?.id),
        user_exam_id: data?.data?.user_exam.id,
        question_id: currentQuestion,
        answer: answer,
        time_spent: timeSpent,
      }
      socket.emit('submit_answer', payload)
      console.log('Jawaban disubmit:', payload)
    }
  }

  const handleNavigate = (questionNumber: number) => {
    setCurrentQuestion(questionNumber)
    setQuestionStartTime(Date.now()) // Reset timer setiap kali ganti soal
  }

  const getQuestionStatus = (num: number) => {
    const isDoubtful = getAnswer(examId, String(num))?.isDoubtful
    if (num === currentQuestion) return 'active'
    if (isDoubtful) return 'doubtful'
    if (hasAnswer(examId, String(num)) && getAnswer(examId, String(num))?.answer !== '') return 'answered'
    return 'unanswered'
  }

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
        alert('Waktu habis atau admin menghentikan ujian Anda.')
        // Panggil fungsi submit Anda di sini
        if (submitExamRef.current) submitExamRef.current()
      } else if (eventData.action === 'unblock') {
        alert('Ujian Anda telah dibuka kembali oleh Admin.')
      }
    })

    newSocket.on('cheat_blocked', () => {
      alert('Ujian Anda diblokir karena terdeteksi kecurangan.')
      // Panggil fungsi submit/block di sini
      if (submitExamRef.current) submitExamRef.current()
    })

    return () => {
      newSocket.close()
    }
  }, [user, examId])

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
          alert(
            'Anda keluar dari mode Fullscreen! Harap klik area ujian untuk kembali fokus.',
          )
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
            isDoubtful={currentAnswer?.isDoubtful || false}
            onToggleDoubtful={() => toggleDoubtful(examId, String(currentQuestion))}
          />
        </div>

        {/* Right Section - Info & Navigation */}
        <div className="col-lg-3 col-xl-3">
          <UserSection user={data?.data?.student} />
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
                  } else if (status === 'doubtful') {
                    btnClass = 'btn-warning'
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
