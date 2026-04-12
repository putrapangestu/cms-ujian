// stores/answerStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type AnswerType = {
  questionId: string
  answer: string | string[] // Single or multiple choice
  answeredAt: string
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
  getAnswer: (examId: string, questionId: string) => AnswerType | undefined
  getExamAnswers: (examId: string) => AnswerType[]
  clearExamAnswers: (examId: string) => void
  clearAllAnswers: () => void
  setCurrentExam: (examId: string) => void
  markAsSynced: () => void
  getAnswerCount: (examId: string) => number
  hasAnswer: (examId: string, questionId: string) => boolean
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
              questionId,
              answer,
              answeredAt: new Date().toISOString(),
            },
          },
        }))
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
    }),
    {
      name: 'exam-answers-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
