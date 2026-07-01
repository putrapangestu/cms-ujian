import { EXAM } from '@/data/const/api_url'
import { apiClient } from '@/lib/api-client'
import { useQueryDataPersistent, useMutationAction } from '@/data/hooks/api/useGlobalFetch'
import { mutate } from 'swr'
import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/data/store/auth_store'
import type { ApiResponseType } from '@/data/types/api_response'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useRef, useCallback } from 'react'
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
  const [showFullscreenOverlay, setShowFullscreenOverlay] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingRetryRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasInteracted = useRef(false)
  const fullscreenExitCount = useRef(0)
  const fullscreenOverlayRef = useRef(false)
  const emitAnswerRef = useRef<((questionId: string, answer: string | string[], timeSpent?: number) => void) | null>(null)

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
    markQuestionSynced,
    getPendingAnswers,
  } = useAnswerStore()

  useEffect(() => {
    if (examId) {
      clearExamAnswers(examId)
    }
  }, [examId, clearExamAnswers])

  const { data, isValidating } = useQueryDataPersistent<
    ApiResponseType<'single', ExamDetailDataType>
  >(EXAM.GET_QUESTIONS_USER, { id: examId, userId: user?.id || '' }, { revalidateOnMount: true })
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
    onError: (err) => {
      const msg = err?.response?.data?.message || ''
      // Ujian sudah diselesaikan oleh sistem/admin → redirect
      if (msg.includes('sudah diselesaikan') || msg.includes('belum dimulai')) {
        Swal.fire({
          title: 'Ujian Telah Berakhir',
          text: 'Ujian sudah diselesaikan oleh sistem. Silakan lihat hasil di beranda.',
          icon: 'info',
          confirmButtonText: 'Ke Beranda',
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          window.location.href = '/user/exam'
        })
      } else {
        Swal.fire('Gagal!', 'Terjadi kesalahan saat mensubmit ujian. Silakan coba lagi.', 'error')
        isSubmitting.current = false
      }
    }
  })

  // Fungsi reusable untuk mengirim jawaban ke socket (digunakan oleh debounce, reconnect, periodic retry)
  const emitAnswerToSocket = useCallback((
    questionId: string,
    answer: string | string[],
    timeSpent?: number
  ) => {
    if (!socketRef.current?.connected) return

    const questionObject = data?.data?.questions?.find((q) => q.question_id === questionId)
    if (!questionObject) return

    const qType = questionObject?.type || questionObject?.question_type || 'single_choice'
    let payloadAnswer: any = null
    let payloadOptionId: any = null

    if (qType === 'essay') {
      payloadAnswer = answer
    } else if (qType === 'multiple_choice') {
      payloadOptionId =
        typeof answer === 'string' && answer.startsWith('[')
          ? JSON.parse(answer as string)
          : Array.isArray(answer)
            ? answer
            : (answer as string).split(',').filter(Boolean)
    } else {
      payloadOptionId = answer
    }

    const payload: any = {
      exam_id: examId,
      student_id: user?.id,
      user_exam_id: data?.data?.user_exam.id,
      question_id: questionId,
      time_spent: timeSpent ?? 0,
    }
    if (payloadAnswer !== null) payload.answer = payloadAnswer
    if (payloadOptionId !== null) payload.question_option_id = payloadOptionId

    socketRef.current.emit('submit_answer', payload)
    console.log('Jawaban dikirim via emitAnswerToSocket:', payload)
  }, [examId, user, data])

  // Sync emitAnswerRef dengan latest emitAnswerToSocket
  emitAnswerRef.current = emitAnswerToSocket

  // 1. Inisialisasi Socket DULU agar saat timer habis, socketRef sudah terisi
  useEffect(() => {
    if (!user?.id || !examId) return

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || 'https://socket-ujian.hummatech.com'

    const newSocket = io(socketUrl, {
      auth: { key: import.meta.env.VITE_SOCKET_KEY || 'Wm9zN2pQeFh3c3RkR1lYcU1vRkR2a2x4V3N3b2xXb1h3eE1nPQ==' },
      query: {
        student_id: data?.data?.user_exam?.user?.student?.id || user?.id,
        exam_id: examId,
      },
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: Infinity,
      reconnectionDelayMax: 10000,
    })

    setSocket(newSocket)
    socketRef.current = newSocket

    // Listen perintah dari admin (misal: Force Submit)
    newSocket.on('admin-action', (eventData: any) => {
      if (eventData.action === 'force_submit') {
        isSubmitting.current = true;
        Swal.fire({
          title: 'Waktu Habis!',
          text: 'Admin telah menghentikan ujian Anda. Nilai sudah dihitung.',
          icon: 'info',
          confirmButtonText: 'Ke Beranda',
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then(() => {
          window.location.href = '/user/exam';
        });
      } else if (eventData.action === 'exam_auto_submitted') {
        // Auto-submit dari server (waktu habis)
        if (!isSubmitting.current) {
          isSubmitting.current = true;
          Swal.fire({
            title: 'Waktu Habis!',
            text: eventData.message || 'Waktu ujian telah habis. Sistem telah menyelesaikan ujian Anda.',
            icon: 'info',
            confirmButtonText: 'Lihat Hasil',
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(() => {
            window.location.href = '/user/exam';
          })
        }
      } else if (eventData.action === 'unblock') {
        Swal.fire('Ujian Dibuka', 'Ujian Anda telah dibuka kembali oleh Admin.', 'success');
      } else if (eventData.action === 'exam_reset') {
        isSubmitting.current = true;
        // Hapus localStorage cache agar data stale tidak dipakai saat start ulang
        const cacheKey = JSON.stringify([EXAM.GET_QUESTIONS_USER, { id: examId, userId: user?.id }])
        localStorage.removeItem(cacheKey)
        mutate(cacheKey, undefined, { revalidate: false })
        Swal.fire({
          title: 'Ujian Direset',
          text: 'Ujian Anda telah direset oleh Admin. Silakan mulai ulang.',
          icon: 'info',
          confirmButtonText: 'Tutup',
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then(() => {
          window.location.href = '/user/exam';
        });
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

    // Auto-retry pending answers saat reconnect (via ref untuk hindari stale closure)
    newSocket.on('connect', () => {
      console.log('Socket reconnected, checking pending answers...')
      const pending = getPendingAnswers(examId)
      if (pending.length > 0) {
        console.log(`Resending ${pending.length} pending answers...`)
        pending.forEach((ans) => {
          emitAnswerRef.current?.(ans.questionId, ans.answer)
        })
      }
    })

    // Tandai jawaban sebagai tersinkronisasi setelah dikonfirmasi server
    newSocket.on('answer_received', (data: { question_id: string, status: string }) => {
      markQuestionSynced(examId, data.question_id)
    })

    return () => {
      // Hapus listeners agar tidak double, tapi biarkan socket hidup
      newSocket.off('admin-action')
      newSocket.off('cheat_blocked')
      newSocket.off('connect')
      newSocket.off('answer_received')
    }
  }, [user, examId, data])

  // Periodic retry safety net tiap 30 detik untuk jawaban pending
  useEffect(() => {
    if (!socket) return

    pendingRetryRef.current = setInterval(() => {
      if (!socket.connected) return

      const pending = getPendingAnswers(examId)
      if (pending.length === 0) return

      console.log(`Periodic retry: ${pending.length} pending answers`)
      pending.forEach((ans) => {
        emitAnswerToSocket(ans.questionId, ans.answer)
      })
    }, 30000)

    return () => {
      if (pendingRetryRef.current) {
        clearInterval(pendingRetryRef.current)
        pendingRetryRef.current = null
      }
    }
  }, [socket, examId, emitAnswerToSocket])

  // 2. Baru inisialisasi Timer
  useEffect(() => {
    // Cegah timer pakai data cache localStorage yang status/start_time-nya sudah obsolete
    if (data?.data?.user_exam.status !== 'in_progress') return
    if (!data?.data?.user_exam.start_time || !data?.data?.exam.duration) return
    // Tunggu background fetch selesai agar data bukan dari localStorage fallback
    if (isValidating) return

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

    const questionId = questionObject.question_id

    // Simpan ke lokal dulu (tanpa sync)
    setAnswer(examId, questionId, answer)

    // Clear debounce sebelumnya
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set debounce 300ms sebelum emit ke socket
    debounceTimer.current = setTimeout(() => {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
      emitAnswerToSocket(questionId, answer, timeSpent)
    }, 300)
  }

  const handleClearAnswer = () => {
    const questionObject = data?.data?.questions?.[currentQuestion - 1]
    if (!questionObject) return
    // Clear lokal saja, jangan emit ke socket
    setAnswer(examId, questionObject.question_id, '')
  }

  const handleFirstInteraction = useCallback(() => {
    if (hasInteracted.current) return
    hasInteracted.current = true
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }, [])

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
        student_id: data?.data?.user_exam?.user?.student?.id || user?.id,
        exam_id: examId,
        user_exam_id: data?.data?.user_exam?.id,
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

  // Polling status ujian tiap 20 detik (fallback jika socket event force_submit/reset terlewat)
  useEffect(() => {
    if (hasSubmitted || isSubmitting.current || !user?.id || !examId) return

    const checkExamStatus = async () => {
      try {
        const res = await apiClient.get(EXAM.GET_QUESTIONS_USER.replace('{id}', examId).replace('{userId}', user.id))
        const userExam = res?.data?.data?.user_exam
        if (!userExam) return

        if (userExam.status === 'completed' && !isSubmitting.current) {
          isSubmitting.current = true
          Swal.fire({
            title: 'Ujian Telah Diakhiri',
            text: 'Ujian Anda telah dihentikan oleh Admin. Nilai sudah dihitung.',
            icon: 'info',
            confirmButtonText: 'Ke Beranda',
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(() => {
            window.location.href = '/user/exam'
          })
        } else if (userExam.status === 'pending' && !isSubmitting.current) {
          isSubmitting.current = true
          Swal.fire({
            title: 'Ujian Direset',
            text: 'Ujian Anda telah direset oleh Admin. Silakan mulai ulang.',
            icon: 'info',
            confirmButtonText: 'Tutup',
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(() => {
            window.location.href = '/user/exam'
          })
        }
      } catch {
        // Abaikan error polling (misal: network error)
      }
    }

    const pollingId = setInterval(checkExamStatus, 20000)

    return () => {
      clearInterval(pollingId)
    }
  }, [hasSubmitted, user?.id, examId])

  // Combined security + anti-cheat listeners (Modul 4)
  useEffect(() => {
    if (hasSubmitted) return // JANGAN pasang listener jika sudah submit

    // === VISIBILITY CHANGE (tab switch detection) ===
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (socket) {
          socket.emit('cheat_warning', {
            student_id: data?.data?.user_exam?.user?.student?.id || user?.id,
            exam_id: examId,
            user_exam_id: data?.data?.user_exam?.id,
            warning_type: 'tab_switch',
          })
        }
      }
    }

    // === FULLSCREEN (force re-enter + cheat_warning + overlay + limit) ===
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        fullscreenExitCount.current++
        fullscreenOverlayRef.current = true
        setShowFullscreenOverlay(true)

        if (fullscreenExitCount.current >= 5) {
          fullscreenOverlayRef.current = false
          setShowFullscreenOverlay(false)

          if (socket) {
            socket.emit('cheat_warning', {
              student_id: data?.data?.user_exam?.user?.student?.id || user?.id,
              exam_id: examId,
              user_exam_id: data?.data?.user_exam?.id,
              warning_type: 'fullscreen_exit_max',
            })
          }

          Swal.fire({
            title: 'Batas Keluar Fullscreen Tercapai!',
            text: 'Anda telah keluar dari mode fullscreen sebanyak 5 kali. Ujian akan diakhiri jika Anda keluar lagi. Apakah Anda yakin ingin mengakhiri ujian?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Akhiri Ujian',
            cancelButtonText: 'Kembali ke Ujian',
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then((result) => {
            if (result.isConfirmed) {
              handleExamTimeout()
            } else {
              fullscreenExitCount.current = 0
            }
          })
          return
        }

        document.documentElement.requestFullscreen().catch(() => {})

        if (socket) {
          socket.emit('cheat_warning', {
            student_id: data?.data?.user_exam?.user?.student?.id || user?.id,
            exam_id: examId,
            user_exam_id: data?.data?.user_exam?.id,
            warning_type: 'fullscreen_exit',
          })
        }
      }
    }

    // === GLOBAL CLICK (re-request fullscreen + tutup overlay) ===
    const handleGlobalClick = () => {
      if (fullscreenOverlayRef.current) {
        fullscreenOverlayRef.current = false
        setShowFullscreenOverlay(false)
      }
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {})
      }
    }

    // === KEYBOARD (blokir shortcut devtools) ===
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's') ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault()
      }
    }

    // === RIGHT CLICK ===
    const handleContextMenu = (e: MouseEvent) => e.preventDefault()

    // === BACK BUTTON ===
    window.history.pushState(null, '', window.location.href)
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
    }

    // === BEFOREUNLOAD ===
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    // === REGISTER ALL LISTENERS ===
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('click', handleGlobalClick)
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // === CLEANUP ===
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('click', handleGlobalClick)
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasSubmitted, socket, user?.id, examId])

  if (hasSubmitted) {
    return (
      <div
        className="container-fluid d-flex justify-content-center align-items-center py-5"
        style={{ minHeight: '100vh', background: '#f4f6fb' }}
      >
        <div
          className="card border-0 shadow-lg rounded-4 p-4 p-md-5"
          style={{
            width: '100%',
            maxWidth: '850px',
            backgroundColor: '#fff',
          }}
        >
          {/* Header */}
          <div className="text-center mb-5">
            <div
              className="mx-auto mb-3 d-flex justify-content-center align-items-center rounded-circle"
              style={{
                width: '90px',
                height: '90px',
                background: '#d1fae5',
                fontSize: '40px',
              }}
            >
              ✅
            </div>

            <h1
              className="fw-bold text-success mb-3"
              style={{ fontSize: '2.5rem' }}
            >
              Ujian Selesai!
            </h1>

            <p
              className="text-muted mx-auto"
              style={{
                maxWidth: '600px',
                fontSize: '1.1rem',
                lineHeight: '1.8',
              }}
            >
              Ujian Anda telah berhasil disubmit.
              <br />
              Selamat telah menyelesaikan ujian ini!
            </p>
          </div>

          {/* Biodata */}
          {summary && (
            <>
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="border rounded-4 p-4 h-100 bg-light">
                    <small className="text-muted d-block mb-2">
                      Nama Peserta
                    </small>

                    <h5 className="fw-bold mb-0">
                      {summary?.user_exam?.student?.name || '-'}
                    </h5>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="border rounded-4 p-4 h-100 bg-light">
                    <small className="text-muted d-block mb-2">
                      Sekolah
                    </small>

                    <h5 className="fw-bold mb-0">
                      {summary?.user_exam?.student?.address || '-'}
                    </h5>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div
                  className="card-header border-0 text-center fw-bold py-4"
                  style={{
                    background: '#f8fafc',
                    fontSize: '1.3rem',
                  }}
                >
                  Ringkasan Hasil
                </div>

                <div className="card-body p-lg-4 fs-5">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item py-4 px-4 d-flex justify-content-between align-items-center">
                      <span className="fs-5">Total Soal</span>

                      <span className="badge bg-primary rounded-pill px-4 py-2 fs-6">
                        {summary?.summary?.total_questions}
                      </span>
                    </li>

                    <li className="list-group-item py-4 px-4 d-flex justify-content-between align-items-center">
                      <span className="fs-5">Total Dijawab</span>

                      <span className="badge bg-dark rounded-pill px-4 py-2 fs-6">
                        {summary?.summary?.answered_questions}
                      </span>
                    </li>

                    {['twk', 'tiu', 'tkp'].map((type) => (
                      <li
                        key={type}
                        className="list-group-item py-4 px-4 d-flex justify-content-between align-items-center"
                      >
                        <span className="fs-5">
                          Nilai {type.toUpperCase()}
                        </span>

                        <span className="badge bg-success rounded-pill px-4 py-2 fs-6">
                          {
                            summary?.summary?.category_scores?.find(
                              (item) =>
                                item.category_name?.toLowerCase() === type
                            )?.score ?? 0
                          }
                        </span>
                      </li>
                    ))}

                    <li className="list-group-item py-4 px-4 d-flex justify-content-between align-items-center fw-bold bg-light">
                      <span
                        style={{
                          fontSize: '1.3rem',
                        }}
                      >
                        Total Nilai
                      </span>

                      <span
                        className="badge bg-success rounded-pill px-4 py-3"
                        style={{
                          fontSize: '1.2rem',
                        }}
                      >
                        {summary?.summary?.total_score}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="text-center mt-2">
            <p
              className="text-muted mb-4"
              style={{
                fontSize: '1.05rem',
              }}
            >
              Silahkan menunggu informasi selanjutnya
            </p>

            <button
              className="btn btn-lg px-5 py-3 rounded-4 fw-semibold"
              style={{
                backgroundColor: '#0f3d3e',
                color: '#fff',
                minWidth: '280px',
              }}
              onClick={() => (window.location.href = '/user/exam')}
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Fullscreen Exit Overlay — block layar sampai user klik */}
      {showFullscreenOverlay && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(0,0,0,0.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
          }}
          onClick={() => {
            fullscreenOverlayRef.current = false
            setShowFullscreenOverlay(false)
            document.documentElement.requestFullscreen().catch(() => {})
          }}
        >
          <div
            style={{
              fontSize: '60px',
              marginBottom: '24px',
            }}
          >
            ⚠️
          </div>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '12px',
            }}
          >
            Anda keluar dari mode layar penuh!
          </h2>
          <p
            style={{
              fontSize: '16px',
              opacity: 0.8,
              marginBottom: '32px',
              textAlign: 'center',
              maxWidth: '480px',
            }}
          >
            demi keamanan ujian, Anda harus tetap dalam mode layar penuh.
            <br />
            Klik di mana saja untuk kembali.
          </p>
          <p
            style={{
              fontSize: '13px',
              opacity: 0.5,
            }}
          >
            Peringatan ke-{fullscreenExitCount.current} dari 5 kali
          </p>
        </div>
      )}
      <div
        className="container py-4"
        style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}
      >
      <div className="row g-4">
        {/* Left Section - Question */}
        <div className="col-lg-9 col-xl-9">
          <div className="row g-3">
            <div className="col-md-12">
              <HeaderExam exam={data?.data?.exam} />
            </div>
          </div>
          <QuestionCard
            currentQuestion={currentQuestion}
            questions={data?.data?.questions}
            handleNavigate={handleNavigate}
            handleAnswerSelect={handleAnswerSelect}
            selectedAnswer={currentAnswer?.answer as string}
            totalQuestions={data?.data?.questions.length || 0}
            onClearAnswer={handleClearAnswer}
            onFirstInteraction={handleFirstInteraction}
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
    </>
  )
}