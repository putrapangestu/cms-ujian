import z from 'zod'
import type { DefaultDataType } from '../types/api_response'

export const questioniGroupSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().max(255).optional(),
  code: z.string().min(1).max(255),
  status: z.string().min(1).max(255),
  question_category_id: z.string().min(1).max(255),
})

export type QuestionGroupType = z.infer<typeof questioniGroupSchema>
export type QuestionGroupDataType = QuestionGroupType &
  DefaultDataType & {
    question_category: QuestionCategoryType
  }

export const questionCategorySchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().max(255).optional(),
  code: z.string().min(1).max(255),
  status: z.string().min(1).max(255),
  start_range: z.number().min(0),
  end_range: z.number().min(0),
})

export type QuestionCategoryType = z.infer<typeof questionCategorySchema>
export type QuestionCategoryDataType = QuestionCategoryType & DefaultDataType

export const questionOptionSchema = z.object({
  id: z.string().optional(),
  option_text: z.string().min(1).max(255),
  is_correct: z.boolean(),
  score: z.number().min(0),
})
export const questionSchema = z.object({
  question_type: z.string().min(1).max(255),
  question_text: z.string().min(1).max(255),
  score: z.number().min(0),
  options: z.array(questionOptionSchema),
  trueFalseAnswer: z.string().optional(),
  correct_answer: z.string().optional(),
})

export type QuestionType = z.infer<typeof questionSchema>
export type QuestionDataType = QuestionType & DefaultDataType
