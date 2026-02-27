import z from "zod";
import type { DefaultDataType } from "../types/api_response";


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
export type ExamDataType = ExamType & DefaultDataType & {
    total_questions: number,
}

export const examQuestionRollSchema = z.object({
    question_banks: z.array(z.string().min(1).max(255)),
})
export type ExamQuestionRollType = z.infer<typeof examQuestionRollSchema>
