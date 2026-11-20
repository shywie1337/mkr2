export const districts = ['Центральний', 'Північний', 'Західний', 'Східний'] as const
export const statuses = ['normal', 'warning', 'critical'] as const
export const sortFields = ['name', 'thermalLoad', 'lastInspectionDate'] as const

export type District = typeof districts[number]
export type Status = typeof statuses[number]
export type SortField = typeof sortFields[number]

export interface StationInput {
  name: string
  address: string
  district: District
  status: Status
  thermalLoad: number
  connectedBuildings: number
  lastInspectionDate: string
}

export interface MeterInput {
  model: string
  serialNumber: string
  pipeType: 'supply' | 'return'
  currentTemp: number
  verificationDueDate: string
}

export interface Meter extends MeterInput {
  id: string
  substationId: string
}

export interface Station extends StationInput {
  id: string
  meters: Meter[]
}

export interface Metrics {
  totalSubstations: number
  totalThermalLoad: number
  byStatus: Record<Status, number>
  byDistrict: Record<District, number>
}

export type FieldErrors = Record<string, string>
