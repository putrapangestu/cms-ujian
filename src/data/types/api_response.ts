export type ApiResponseType<T = 'single' | 'multiple', TData = any> = {
  success: boolean
  message?: string
  error?: string
  data?: T extends 'single' ? TData : TData[]
}

export type ApiPaginatedResponse<T> = {
  success: boolean
  message?: string
  error?: string
  data?: T[]
  pagination?: {
    current_page: number
    total_pages: number
    per_page: number
    total_items: number
    has_next_page: boolean
    has_previous_page: boolean
  }
}

export type ApiResponsePaginationType<T> = {
  success: boolean
  message?: string
  error?: string
  data?: {
    data: T[]
    pagination: PaginationType
  }
}

export type PaginationType = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type DefaultDataType = {
  id: string
  created_at: string
  updated_at: string
}
