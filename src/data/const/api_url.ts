import type { ObjectType } from "../types/object"



type UrlGroupType = ObjectType<string>

export const AUTH = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
    LOGOUT: '/auth/logout',
    ASSIGN_ROLE: '/auth/assign-role/{id}/{role_name}',
    ME: '/auth/me',
    LOGIN_HISTORY: '/auth/history-login',
    SEND_RESET_PASSWORD: '/auth/reset-password',
    CHECK_TOKEN: '/auth/{token}/check-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
} as const satisfies UrlGroupType

export const STUDENT = {
    GET: '/students',
    CREATE: '/admin/students',
    UPDATE: '/admin/students/{id}',
    DELETE: '/admin/students/{id}',
    GET_BY_ID: '/admin/students/{id}',
} as const satisfies UrlGroupType

export const STUDENT_GROUP = {
    GET: '/student-groups', 
    CREATE: '/admin/student-groups',
    UPDATE: '/admin/student-groups/{id}',
    DELETE: '/admin/student-groups/{id}',
    GET_BY_ID: '/admin/student-groups/{id}',
} as const satisfies UrlGroupType

export const QUESTION_GROUP = {
    GET: '/question-groups', 
    CREATE: '/admin/question-groups',
    UPDATE: '/admin/question-groups/{id}',
    DELETE: '/admin/question-groups/{id}',
    GET_BY_ID: '/admin/question-groups/{id}',
} as const satisfies UrlGroupType