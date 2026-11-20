import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { getStations, updateStations } from './storage.js'
import { ApiError, readBody, validateMeter, validateStation } from './validation.js'
import { districts, sortFields, statuses } from './types.js'
import type { Metrics, SortField, Station } from './types.js'

export const routes = Router()

function findStation(items: Station[], id: string) {
  const station = items.find((item) => item.id === id)
  if (!station) throw new ApiError(404, 'Тепловий пункт не знайдено.')
  return station
}

routes.get('/substations', (req, res) => {
  const { search = '', district = '', status = '', sortBy = 'name', sortOrder = 'asc' } = req.query
  if (
    typeof search !== 'string' ||
    (district !== '' && !districts.includes(district as Station['district'])) ||
    (status !== '' && !statuses.includes(status as Station['status'])) ||
    !sortFields.includes(sortBy as SortField) ||
    (sortOrder !== 'asc' && sortOrder !== 'desc')
  ) throw new ApiError(400, 'Некоректні параметри фільтрації або сортування.')

  const query = search.trim().toLocaleLowerCase('uk')
  const items = getStations().filter((item) => (
    (!district || item.district === district) && (!status || item.status === status) &&
    [item.name, item.address].some((value) => value.toLocaleLowerCase('uk').includes(query))
  ))
  items.sort((a, b) => {
    const field = sortBy as SortField
    const order = field === 'thermalLoad'
      ? a.thermalLoad - b.thermalLoad
      : a[field].localeCompare(b[field], 'uk', { numeric: true })
    return sortOrder === 'desc' ? -order : order
  })
  res.json(items)
})

routes.get('/substations/:id', (req, res) => {
  res.json(findStation(getStations(), req.params.id))
})

routes.post('/substations', async (req, res) => {
  const input = validateStation(readBody(req.body))
  const station = { ...input, id: randomUUID(), meters: [] }
  await updateStations((items) => items.push(station))
  res.status(201).json(station)
})

routes.put('/substations/:id', async (req, res) => {
  const updated = await updateStations((items) => {
    const station = findStation(items, req.params.id)
    const input = validateStation({ ...station, ...readBody(req.body) })
    return Object.assign(station, input)
  })
  res.json(updated)
})

routes.delete('/substations/:id', async (req, res) => {
  await updateStations((items) => {
    const station = findStation(items, req.params.id)
    // Вузли обліку зберігаються у батьківському записі.
    items.splice(items.indexOf(station), 1)
  })
  res.status(204).end()
})

routes.post('/substations/:id/meters', async (req, res) => {
  const meter = await updateStations((items) => {
    const station = findStation(items, req.params.id)
    const input = validateMeter(readBody(req.body))
    const serial = input.serialNumber.toUpperCase()
    if (items.some((item) => item.meters.some((meter) => meter.serialNumber.toUpperCase() === serial))) {
      throw new ApiError(400, 'Серійний номер уже зареєстровано.', { serialNumber: 'Вкажіть унікальний номер.' })
    }
    const created = { ...input, id: randomUUID(), substationId: station.id }
    station.meters.push(created)
    return created
  })
  res.status(201).json(meter)
})

routes.delete('/substations/:id/meters/:meterId', async (req, res) => {
  await updateStations((items) => {
    const station = findStation(items, req.params.id)
    const index = station.meters.findIndex((meter) => meter.id === req.params.meterId)
    if (index === -1) throw new ApiError(404, 'Вузол обліку не знайдено.')
    station.meters.splice(index, 1)
  })
  res.json({ message: 'Вузол обліку видалено.' })
})

routes.get('/metrics', (_req, res) => {
  const items = getStations()
  const metrics: Metrics = {
    totalSubstations: items.length,
    totalThermalLoad: 0,
    byStatus: { normal: 0, warning: 0, critical: 0 },
    byDistrict: { Центральний: 0, Північний: 0, Західний: 0, Східний: 0 },
  }
  for (const item of items) {
    metrics.totalThermalLoad += item.thermalLoad
    metrics.byStatus[item.status]++
    metrics.byDistrict[item.district]++
  }
  metrics.totalThermalLoad = Number(metrics.totalThermalLoad.toFixed(6))
  res.json(metrics)
})
