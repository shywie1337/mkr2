import { computed, onScopeDispose, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { districts, sortFields, statuses } from '../types'
import type { Station } from '../types'
import { stationService } from '../services/stations'
import { readError } from '../api/client'
import { useRequest } from './useRequest'

export const defaults = { search: '', district: '', status: '', sortBy: 'name', sortOrder: 'asc' }

export function useRegistry() {
  const route = useRoute()
  const router = useRouter()
  const items = ref<Station[]>([])
  const loading = ref(true)
  const error = ref('')
  const { busy: deleting, error: deleteError, run } = useRequest()
  let request: AbortController | undefined

  function query(key: string) {
    const value = route.query[key]
    return typeof value === 'string' ? value : ''
  }

  function option(key: keyof typeof defaults, choices: readonly string[]) {
    const value = query(key)
    return choices.includes(value) ? value : defaults[key]
  }

  const filters = computed(() => ({
    search: query('search'),
    district: option('district', districts),
    status: option('status', statuses),
    sortBy: option('sortBy', sortFields),
    sortOrder: option('sortOrder', ['asc', 'desc']),
  }))
  const filtered = computed(() => Boolean(filters.value.search.trim() || filters.value.district || filters.value.status))

  function setFilter(key: keyof typeof defaults, value: string) {
    void router.replace({ query: { ...route.query, [key]: value === defaults[key] ? undefined : value } })
  }

  function reset() {
    void router.replace({ query: {} })
  }

  async function load() {
    request?.abort()
    const controller = new AbortController()
    request = controller
    loading.value = true
    error.value = ''
    try {
      const result = await stationService.list(filters.value, controller.signal)
      if (!controller.signal.aborted) items.value = result
    } catch (problem) {
      if (!controller.signal.aborted) error.value = readError(problem).message
    } finally {
      if (!controller.signal.aborted) loading.value = false
    }
  }

  async function remove(item: Station) {
    if (deleting.value || !window.confirm('Видалити «' + item.name + '» разом із його вузлами обліку?')) return
    if (await run(async () => { await stationService.remove(item.id); return true })) await load()
  }

  watch(filters, load, { immediate: true })
  onScopeDispose(() => request?.abort())

  return { items, loading, error, deleting, deleteError, filters, filtered, setFilter, reset, load, remove }
}
