import z from 'zod'
import type { DefaultDataType } from '../types/api_response'

export const examSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().max(255).optional(),
  duration: z.number().min(1),
  passing_score: z.number().min(0),
  start_date: z.string().min(1).max(255),
  end_date: z.string().min(1).max(255),
  student_groups: z.array(z.string().min(1).max(255)),
})

export type ExamType = z.infer<typeof examSchema>
export type ExamDataType = ExamType &
  DefaultDataType & {
    total_questions: number
  }

export const examQuestionRollSchema = z.object({
  question_banks: z.array(z.string().min(1).max(255)),
})
export type ExamQuestionRollType = z.infer<typeof examQuestionRollSchema>

export type ExamTodayDataType = {
  today: ExamDataType[]
  today_summary: any[]
  overall_summary: {
    by_status: {
      pending: number
    }
    average_score: number | null
  }
  server_time: string
}

export type OptionDataType = {
  id: string
  option_text: string
}

export type QuestionDataType = {
  id: string
  question_number: number
  question_order: number
  question_text: string
  question_type: string
  score: number
  group_name: string
  options: OptionDataType[]
}

export type StudentExamDataType = {
  id: string
  nisn: string
  name: string
  phone: string | null
  group: {
    name: string
  }
}

export type UserExamDataType = DefaultDataType & {
  start_time: string
  end_time: string
  score: number
  status: string
}

export type ExamDetailDataType = {
  exam: ExamDataType
  questions: QuestionDataType[]
  student: StudentExamDataType
  user_exam: UserExamDataType
}
