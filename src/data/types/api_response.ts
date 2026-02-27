export type ApiResponseType<T = 'single' | 'multiple', D = any> = {
    success: boolean;
    message?: string;
    error?: string;
    data?: T extends 'single' ? D : D[]
}

export type ApiResponsePaginationType<T> = {
    success: boolean;
    message?: string;
    error?: string;
    data?: {
        data: T[];
        pagination: PaginationType;
    }
}

export type PaginationType = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export type DefaultDataType = {
    id: string;
    created_at: string;
    updated_at: string;
}