import type { Status } from './types'

export const statusNames: Record<Status, string> = {
  normal: 'У нормі', warning: 'Потребує уваги', critical: 'Аварійний стан',
}

export const statusClasses: Record<Status, string> = {
  normal: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-900',
  critical: 'bg-red-100 text-red-800',
}

const numberFormat = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 6 })
export const formatNumber = (value: number) => numberFormat.format(value)

export function formatDate(value: string) {
  return value.split('-').reverse().join('.')
}
