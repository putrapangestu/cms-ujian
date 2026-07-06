import { z } from 'zod'

export const EbookSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, 'Nama wajib diisi'),
  question_category_id: z.string().min(1, 'Kategori wajib dipilih'),
  file_path: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type EbookDataType = z.infer<typeof EbookSchema>

// Schema for creating/updating (without optional fields)
export const EbookFormSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  question_category_id: z.string().min(1, 'Kategori wajib dipilih'),
})
