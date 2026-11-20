import { readFile, rename, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Station } from './types.js'

const file = process.env.DATA_FILE
  ? resolve(process.env.DATA_FILE)
  : fileURLToPath(new URL('../data/substations.json', import.meta.url))

let stations: Station[] = []
let writes: Promise<void> = Promise.resolve()

export async function loadStations() {
  const data: unknown = JSON.parse(await readFile(file, 'utf8'))
  if (!Array.isArray(data)) throw new Error('Очікується масив теплових пунктів.')
  stations = data as Station[]
}

export function getStations() {
  return stations
}

export function updateStations<T>(change: (items: Station[]) => T) {
  const operation = writes.then(async () => {
    const items = structuredClone(stations)
    const result = change(items)
    await writeFile(file + '.tmp', JSON.stringify(items, null, 2) + '\n', 'utf8')
    await rename(file + '.tmp', file)
    stations = items
    return result
  })
  writes = operation.then(() => {}, () => {})
  return operation
}
