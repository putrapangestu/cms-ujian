import type { ObjectType } from '../types/object'

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
  BULK_DELETE: '/admin/students/bulk-delete',
  GET_BY_ID: '/students/{id}',
  EXAM_HISTORY: '/students/{id}/exam-history',
  EXAM_SUMMARY: '/students/{id}/exam-summary',
  EXAM_HISTORY_EXPORT: '/students/{id}/exam-history/export',
  DOWNLOAD_TEMPLATE: '/students/download-template',
  IMPORT_EXCEL: '/students/import',
  EXPORT: '/admin/students/export',
} as const satisfies UrlGroupType

export const STUDENT_GROUP = {
  GET: '/student-groups',
  CREATE: '/admin/student-groups',
  UPDATE: '/admin/student-groups/{id}',
  DELETE: '/admin/student-groups/{id}',
  GET_BY_ID: '/student-groups/{id}',
  ROLL_MULTIPLE: '/student-groups/roll-multiple',
} as const satisfies UrlGroupType

export const QUESTION_GROUP = {
  GET: '/question-groups',
  CREATE: '/admin/question-groups',
  UPDATE: '/admin/question-groups/{id}',
  DELETE: '/admin/question-groups/{id}',
  GET_BY_ID: '/question-groups/{id}',
  UPDATE_RANGE: '/admin/question-groups/bulk-update-range',
  COPY: '/admin/question-groups/{id}/copy',
} as const satisfies UrlGroupType

export const QUESTION_CATEGORY = {
  GET: '/question-categories',
  CREATE: '/admin/question-categories',
  UPDATE: '/admin/question-categories/{id}',
  DELETE: '/admin/question-categories/{id}',
  GET_BY_ID: '/question-categories/{id}',
} as const satisfies UrlGroupType

export const QUESTION_BANK = {
  GET: '/question-bank',
  IMPORT_EXAMVIEW: '/question-bank/import-examview',
  IMPORT_EXCEL: '/question-bank/import',
  DOWNLOAD_TEMPLATE: '/question-bank/download-template',
} as const satisfies UrlGroupType

export const QUESTION = {
  GET: '/questions',
  CREATE: '/questions',
  UPDATE: '/questions/{id}',
  DELETE: '/questions/{id}',
  BULK_DELETE: '/questions/bulk-delete',
  GET_BY_ID: '/admin/questions/{id}',
} as const satisfies UrlGroupType

export const EBOOK = {
  GET: '/ebooks',
  CREATE: '/ebooks',
  UPDATE: '/ebooks/{id}',
  DELETE: '/ebooks/{id}',
  BULK_DELETE: '/ebooks/bulk-delete',
  GET_BY_ID: '/ebooks/{id}',
  DOWNLOAD: '/ebooks/{id}/download',
} as const satisfies UrlGroupType

export const EXAM = {
  GET: '/exams',
  GET_BY_ID: '/exams/{id}',
  CREATE: '/admin/exams',
  UPDATE: '/admin/exams/{id}',
  DELETE: '/admin/exams/{id}',
  COPY: '/admin/exams/{id}/copy',
  USERS: '/exams/{id}/user-exams',
  DELETE_USER: '/admin/user-exams/{id}',
  DELETE_USER_BULK: '/admin/user-exams/bulk-delete',
  EXPORT_USERS: '/exams/{id}/user-exams/export',
  QUESTIONS: '/exams/{id}/questions',
  ROLL_QUESTIONS: '/exams/{id}/select-questions',
  TODAY: '/exams/today',
  HISTORY: '/exams/history',
  DETAIL_HISTORY: '/exams/history/{id}',
  START: '/exams/{id}/start',
  GET_QUESTIONS_USER: '/exams/{id}/questions-for-student/{userId}',
  FINISH: '/exams/{id}/finish',
} as const satisfies UrlGroupType

export const EXAM_MONITORING = {
  ACTIVE: '/exam-monitoring/active',
  DETAIL: '/exam-monitoring/realtime/{id}',
  FORCE_SUBMIT: '/exam-monitoring/force-submit',
  UNBLOCK: '/exam-monitoring/unblock',
  RESET: '/exam-monitoring/reset',
} as const satisfies UrlGroupType

export const DASHBOARD = {
  SUMMARY: '/admin/dashboard/summary',
  ACTIVE_EXAMS: '/admin/dashboard/active-exams',
  CHARTS_STUDENTS: '/admin/dashboard/charts/students',
  CHARTS_EXAMS: '/admin/dashboard/charts/exams',
} as const satisfies UrlGroupType

export const SOCKET_URL = 'https://socket-ujian.hummatech.com'
