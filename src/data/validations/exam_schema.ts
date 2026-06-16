import z from 'zod'
import type { DefaultDataType } from '../types/api_response'

export const examSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().max(255).optional(),
  duration: z.number().min(1),
  passing_score: z.number().min(0),
  exam_type: z.enum(['pretest', 'skd']).default('skd'),
  start_date: z.string().min(1).max(255),
  end_date: z.string().min(1).max(255),
  student_groups: z.array(z.string().min(1).max(255)).optional(),
  students: z.array(z.string()).optional(),
  total_questions: z.number().min(1),
})

export type ExamType = z.infer<typeof examSchema>
export type ExamDataType = ExamType &
  DefaultDataType & {
    total_questions: number
    question_exams_count?: number
    exam_type?: 'pretest' | 'skd'
    studentGroups?: Array<{
      id: string
      name: string
      description: string | null
    }>
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

export type UserDataType = {
  id: string,
  name: string,
  email: string,
  nisn?: string, 
  address?: string,
  group_name?: string,
  student?: StudentExamDataType
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
  total_score?: number
  score_twk?: number
  score_tiu?: number
  score_tkp?: number
  is_passed?: boolean
  status: string
  user?: UserDataType
}

export type ExamDetailDataType = {
  exam: ExamDataType
  questions: QuestionDataType[]
  student: StudentExamDataType
  user_exam: UserExamDataType
}

export type UserAnswerDataType = {
  id: string
  question_id: string
  option_id: string | null
  answer_text: string | null
  is_correct: boolean
  score: number
  question: QuestionDataType
}

export type ExamHistoryDataType = {
  id: string
  exam_id: string
  student_id: string
  status: string
  start_time: string | null
  end_time: string | null
  score: number | null
  created_at: string
  updated_at: string
  user_answers_count: number
  exam: ExamDataType
  user_answers?: UserAnswerDataType[]
}

export type ExamHistoryDetailDataType = {
  user_exam: ExamHistoryDataType
  summary: {
    total_questions: number
    answered_questions: number
    correct_answers: number
    wrong_answers?: number
    total_score: number
    category_scores?: any
    exam_type?: string
  }
}

