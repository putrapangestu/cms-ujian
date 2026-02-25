import z from "zod"
import type { DefaultDataType } from "../types/api_response"

export const questioniGroupSchema = z.object({
    name: z.string().min(3).max(255),
    description: z.string().max(255).optional(),
    code: z.string().min(1).max(255),
    status: z.string().min(1).max(255),
})

export type QuestionGroupType = z.infer<typeof questioniGroupSchema>
export type QuestionGroupDataType = QuestionGroupType & DefaultDataType
