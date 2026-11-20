import { ref } from 'vue'
import { readError } from '../api/client'
import type { FieldErrors } from '../types'

export function useRequest() {
  const busy = ref(false)
  const error = ref('')
  const fields = ref<FieldErrors>({})

  async function run<T>(request: () => Promise<T>): Promise<T | undefined> {
    if (busy.value) return
    busy.value = true
    error.value = ''
    fields.value = {}
    try {
      return await request()
    } catch (problem) {
      const response = readError(problem)
      error.value = response.message
      fields.value = response.fields
    } finally {
      busy.value = false
    }
  }

  return { busy, error, fields, run }
}
