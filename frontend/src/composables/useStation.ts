import { onMounted, ref } from 'vue'
import { stationService } from '../services/stations'
import { useRequest } from './useRequest'
import type { MeterInput, Station } from '../types'

export function useStation(id: string) {
  const station = ref<Station>()
  const { busy: loading, error, run: request } = useRequest()
  const { busy: changing, fields, error: meterError, run: change } = useRequest()

  async function load() {
    const result = await request(() => stationService.get(id))
    if (result) station.value = result
  }

  async function add(input: MeterInput) {
    const meter = await change(() => stationService.addMeter(id, input))
    if (!meter || !station.value) return false
    station.value.meters.push(meter)
    return true
  }

  async function remove(meterId: string) {
    if (changing.value || !window.confirm('Видалити цей вузол обліку?')) return
    const deleted = await change(async () => {
      await stationService.removeMeter(id, meterId)
      return true
    })
    if (deleted && station.value) station.value.meters = station.value.meters.filter((meter) => meter.id !== meterId)
  }

  onMounted(load)
  return { station, loading, error, load, changing, fields, meterError, add, remove }
}
