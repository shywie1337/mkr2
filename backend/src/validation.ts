import { districts, statuses } from './types.js'
import type { FieldErrors, MeterInput, StationInput } from './types.js'

export class ApiError extends Error {
  constructor(public status: number, message: string, public errors?: FieldErrors) {
    super(message)
  }
}

export function readBody(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(400, 'Очікується JSON-об’єкт.')
  }
  return value as Record<string, unknown>
}

export function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function check(errors: FieldErrors) {
  if (Object.keys(errors).length) throw new ApiError(400, 'Перевірте поля форми.', errors)
}

export function validateStation(data: Record<string, unknown>): StationInput {
  const errors: FieldErrors = {}
  const name = text(data.name)
  const address = text(data.address)
  const { district, status, thermalLoad, connectedBuildings, lastInspectionDate } = data
  if (name.length < 3 || name.length > 60) errors.name = 'Від 3 до 60 символів.'
  if (!address) errors.address = 'Вкажіть адресу.'
  if (!districts.includes(district as StationInput['district'])) errors.district = 'Оберіть район.'
  if (!statuses.includes(status as StationInput['status'])) errors.status = 'Оберіть стан.'
  if (typeof thermalLoad !== 'number' || !Number.isFinite(thermalLoad) || thermalLoad < 0.05 || thermalLoad > 25) {
    errors.thermalLoad = 'Від 0,05 до 25 Гкал/год.'
  }
  if (typeof connectedBuildings !== 'number' || !Number.isSafeInteger(connectedBuildings) || connectedBuildings < 1) {
    errors.connectedBuildings = 'Ціле число від 1.'
  }
  if (!validDate(lastInspectionDate)) errors.lastInspectionDate = 'Вкажіть дійсну дату огляду.'
  check(errors)
  return { name, address, district, status, thermalLoad, connectedBuildings, lastInspectionDate } as StationInput
}

export function validateMeter(data: Record<string, unknown>): MeterInput {
  const errors: FieldErrors = {}
  const model = text(data.model)
  const serialNumber = text(data.serialNumber)
  const { pipeType, currentTemp, verificationDueDate } = data
  if (model.length < 2 || model.length > 40) errors.model = 'Від 2 до 40 символів.'
  if (serialNumber.length < 4 || serialNumber.length > 20) errors.serialNumber = 'Від 4 до 20 символів.'
  if (pipeType !== 'supply' && pipeType !== 'return') errors.pipeType = 'Оберіть трубопровід.'
  if (typeof currentTemp !== 'number' || !Number.isFinite(currentTemp) || currentTemp < 10 || currentTemp > 150) {
    errors.currentTemp = 'Від 10 до 150 °C.'
  }
  if (!validDate(verificationDueDate)) errors.verificationDueDate = 'Вкажіть дійсну дату повірки.'
  check(errors)
  return { model, serialNumber, pipeType, currentTemp, verificationDueDate } as MeterInput
}
