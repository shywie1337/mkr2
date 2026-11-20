import { api } from '../api/client'
import type { Meter, MeterInput, Metrics, Station, StationInput } from '../types'

function path(id: string) {
  return '/api/substations/' + encodeURIComponent(id)
}

export const stationService = {
  async list(params: Record<string, string>, signal: AbortSignal) {
    return (await api.get<Station[]>('/api/substations', { params, signal })).data
  },
  async get(id: string) {
    return (await api.get<Station>(path(id))).data
  },
  async save(input: StationInput, id?: string) {
    const response = id ? await api.put<Station>(path(id), input) : await api.post<Station>('/api/substations', input)
    return response.data
  },
  async remove(id: string) {
    await api.delete(path(id))
  },
  async addMeter(id: string, input: MeterInput) {
    return (await api.post<Meter>(path(id) + '/meters', input)).data
  },
  async removeMeter(id: string, meterId: string) {
    await api.delete(path(id) + '/meters/' + encodeURIComponent(meterId))
  },
  async metrics() {
    return (await api.get<Metrics>('/api/metrics')).data
  },
}
