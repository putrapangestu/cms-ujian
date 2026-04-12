import z from 'zod'
import type { DefaultDataType } from '../types/api_response'

export const studentSchema = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(255).optional(),
  birth_date: z.string().min(1).max(255),
  address: z.string().max(255).optional(),
  status: z.string().min(1).max(255),
})

export type StudentType = z.infer<typeof studentSchema>
export type StudentDataType = StudentType & DefaultDataType

export const studentGroupSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().max(255).optional().nullable(),
  max_students: z.number().min(1).max(255),
  status: z.string().min(1).max(255),
  students_count: z.number().nullable().optional(),
})

export type StudentGroupType = z.infer<typeof studentGroupSchema>
export type StudentGroupDataType = StudentGroupType & DefaultDataType

export const studentGroupRollSchema = z.object({
  rolls: z.array(
    z.object({
      student_id: z.string().min(1).max(255),
      new_group_id: z.string().min(1).max(255),
    }),
  ),
})
export type StudentGroupRollType = z.infer<typeof studentGroupRollSchema>
