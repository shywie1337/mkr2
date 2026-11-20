import axios from 'axios'
import type { FieldErrors } from '../types'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, timeout: 8000 })

export function readError(error: unknown) {
  if (axios.isAxiosError<{ message?: string; errors?: FieldErrors }>(error)) {
    return {
      message: error.response?.data?.message ?? 'Сервер не відповідає. Перевірте підключення та повторіть спробу.',
      fields: error.response?.data?.errors ?? {},
    }
  }
  return { message: 'Не вдалося виконати дію.', fields: {} }
}
