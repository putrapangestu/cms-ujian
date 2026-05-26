// stores/answerStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type AnswerType = {
  questionId: string
  answer: string | string[] // Single or multiple choice
  answeredAt: string
  isDoubtful?: boolean // Flag for ragu-ragu
  synced: boolean // NEW: apakah sudah tersinkronisasi ke server
}

type AnswerStoreType = {
  // State
  answers: Record<string, AnswerType> // Key: examId_questionId
  currentExamId: string | null
  lastSyncedAt: string | null

  // Actions
  setAnswer: (
    examId: string,
    questionId: string,
    answer: string | string[],
  ) => void
  toggleDoubtful: (examId: string, questionId: string) => void
  getAnswer: (examId: string, questionId: string) => AnswerType | undefined
  getExamAnswers: (examId: string) => AnswerType[]
  clearExamAnswers: (examId: string) => void
  clearAllAnswers: () => void
  setCurrentExam: (examId: string) => void
  markAsSynced: () => void
  getAnswerCount: (examId: string) => number
  hasAnswer: (examId: string, questionId: string) => boolean
  markQuestionSynced: (examId: string, questionId: string) => void
  getPendingAnswers: (examId: string) => AnswerType[]
  hasPendingAnswers: (examId: string) => boolean
}

export const useAnswerStore = create<AnswerStoreType>()(
  persist(
    (set, get) => ({
      // Initial State
      answers: {},
      currentExamId: null,
      lastSyncedAt: null,

      // Set/Update Answer
      setAnswer: (examId, questionId, answer) => {
        const key = `${examId}_${questionId}`
        set((state) => ({
          answers: {
            ...state.answers,
            [key]: {
              ...state.answers[key],
              questionId,
              answer,
              answeredAt: new Date().toISOString(),
              synced: false, // ← NEW: reset sync status
            },
          },
        }))
      },

      // Toggle Ragu-Ragu
      toggleDoubtful: (examId, questionId) => {
        const key = `${examId}_${questionId}`
        set((state) => {
          const currentAnswer = state.answers[key]
          // Kita asumsikan user bisa ragu-ragu walau belum jawab,
          // jadi kalau belum ada entry, kita buat dummy tanpa jawaban
          return {
            answers: {
              ...state.answers,
              [key]: currentAnswer 
                ? { ...currentAnswer, isDoubtful: !currentAnswer.isDoubtful }
                : { questionId, answer: '', answeredAt: new Date().toISOString(), isDoubtful: true, synced: false },
            }
          }
        })
      },

      // Get Single Answer
      getAnswer: (examId, questionId) => {
        const key = `${examId}_${questionId}`
        return get().answers[key]
      },

      // Get All Answers for Exam
      getExamAnswers: (examId) => {
        const allAnswers = get().answers
        return Object.entries(allAnswers)
          .filter(([key]) => key.startsWith(`${examId}_`))
          .map(([_, answer]) => answer)
      },

      // Clear Exam Answers
      clearExamAnswers: (examId) => {
        set((state) => {
          const newAnswers = { ...state.answers }
          Object.keys(newAnswers).forEach((key) => {
            if (key.startsWith(`${examId}_`)) {
              delete newAnswers[key]
            }
          })
          return { answers: newAnswers }
        })
      },

      // Clear All Answers
      clearAllAnswers: () => {
        set({ answers: {}, currentExamId: null, lastSyncedAt: null })
      },

      // Set Current Exam
      setCurrentExam: (examId) => {
        set({ currentExamId: examId })
      },

      // Mark as Synced
      markAsSynced: () => {
        set({ lastSyncedAt: new Date().toISOString() })
      },

      // Get Answer Count
      getAnswerCount: (examId) => {
        return get().getExamAnswers(examId).length
      },

      // Check if Has Answer
      hasAnswer: (examId, questionId) => {
        const key = `${examId}_${questionId}`
        return key in get().answers
      },

      // Mark specific question as synced
      markQuestionSynced: (examId, questionId) => {
        const key = `${examId}_${questionId}`
        set((state) => {
          const existing = state.answers[key]
          if (!existing) return state // jawaban tidak ada, skip
          return {
            answers: {
              ...state.answers,
              [key]: {
                ...existing,
                synced: true,
              },
            },
          }
        })
      },

      // Get all pending (unsynced) answers for an exam
      getPendingAnswers: (examId) => {
        return get()
          .getExamAnswers(examId)
          .filter((ans) => !ans.synced && ans.answer !== '' && ans.answer !== '[]')
      },

      // Check if there are any pending answers
      hasPendingAnswers: (examId) => {
        return get().getPendingAnswers(examId).length > 0
      },
    }),
    {
      name: 'exam-answers-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
