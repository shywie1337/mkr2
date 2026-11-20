import { onMounted, ref } from 'vue'
import { stationService } from '../services/stations'
import type { Metrics } from '../types'
import { useRequest } from './useRequest'

export function useMetrics() {
  const metrics = ref<Metrics>()
  const { busy, error, run } = useRequest()

  async function load() {
    const result = await run(stationService.metrics)
    if (result) metrics.value = result
  }
  onMounted(load)

  return { metrics, busy, error, load }
}
