import cors from 'cors'
import express from 'express'
import type { ErrorRequestHandler } from 'express'
import { routes } from './routes.js'
import { loadStations } from './storage.js'
import { ApiError } from './validation.js'

const app = express()
app.use(cors({ origin: (process.env.CORS_ORIGIN ?? 'http://127.0.0.1:4187,http://localhost:4187').split(',') }))
app.use(express.json({ limit: '32kb' }))
app.use('/api', routes)
app.use((_req, res) => { res.status(404).json({ message: 'Адресу не знайдено.' }) })

const handleError: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) { next(error); return }
  if (error instanceof ApiError) {
    res.status(error.status).json({ message: error.message, errors: error.errors })
  } else if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ message: 'Некоректний JSON у запиті.' })
  } else {
    res.status(500).json({ message: 'Не вдалося виконати операцію на сервері.' })
  }
}
app.use(handleError)

await loadStations()
const port = Number(process.env.PORT ?? 3008)
app.listen(port, '127.0.0.1', () => console.log('API: http://127.0.0.1:' + port))
