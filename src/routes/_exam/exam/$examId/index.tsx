import { EXAM } from '@/data/const/api_url'
import { useQueryDataPersistent } from '@/data/hooks/api/useGlobalFetch'
import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/data/store/auth_store'
import type { ApiResponseType } from '@/data/types/api_response'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
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

  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)

  const {
    setAnswer,
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

    const updateCountdown = () => {
      const now = dayjs()
      const diff = endTime.diff(now, 'minutes')
      setTimeRemaining(diff > 0 ? diff : 0)
    }
    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [data])

  const handleAnswerSelect = (answer: string) => {
    setAnswer(examId, String(currentQuestion), answer)
  }

  const handleNavigate = (questionNumber: number) => {
    setCurrentQuestion(questionNumber)
  }

  const getQuestionStatus = (num: number) => {
    if (num === currentQuestion) return 'active'
    if (hasAnswer(examId, String(num))) return 'answered'
    return 'unanswered'
  }

  useEffect(() => {
    if (!user?.id || !examId) return

    const newSocket = io('https://socket-ujian.hummatech.com', {
      auth: { key: 'Wm9zN2pQeFh3c3RkR1lYcU1vRkR2a2x4V3N3b2xXb1h3eE1nPQ==' },
      query: { userId: user?.id, examId: examId },
    })

    setSocket(newSocket)

    // Listen perintah dari admin (misal: Force Submit)
    newSocket.on('force_submit', () => {
      alert('Waktu habis atau admin menghentikan ujian Anda.')
      // Panggil fungsi submit Anda di sini
    })

    return () => {
      newSocket.close()
    }
  }, [user, examId])

  useEffect(() => {
    if (!socket) return

    // Fungsi untuk mengirim data
    const sendPeriodicData = () => {
      const allAnswers = getExamAnswers(examId)
      const payload = {
        userId: user?.id,
        examId: examId,
        answer: allAnswers,
      }

      socket.emit('answer_sync', payload)
      console.log('Data sinkronisasi dikirim:', payload)
    }

    // Set interval setiap 10.000 ms (10 detik)
    const intervalId = setInterval(sendPeriodicData, 10000)

    // CLEANUP: Sangat penting untuk menghapus interval saat komponen unmount
    // atau saat socket berubah/terputus
    return () => {
      clearInterval(intervalId)
      console.log('Interval pengiriman dihentikan.')
    }
  }, [socket, user?.id, examId, getExamAnswers])

  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === 'hidden') {
  //       handleUserCheating();
  //     }
  //   };

  //   const handleFullscreenChange = () => {
  //     if (!document.fullscreenElement) {
  //       setTimeout(() => {
  //         alert("Anda keluar dari mode Fullscreen! Harap klik area ujian untuk kembali fokus.");
  //       }, 100);
  //     }
  //   };

  //   document.addEventListener('visibilitychange', handleVisibilityChange);
  //   document.addEventListener('fullscreenchange', handleFullscreenChange);

  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //     document.removeEventListener('fullscreenchange', handleFullscreenChange);
  //   };
  // }, [handleUserCheating]);

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
          />
        </div>

        {/* Right Section - Info & Navigation */}
        <div className="col-lg-3 col-xl-3">
          <UserSection user={data?.data?.student} />
          <TimerCard initialMinutes={timeRemaining} />

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
