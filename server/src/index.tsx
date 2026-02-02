import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/bun'
import { join } from 'path'
import type { ApiResponse } from 'shared/dist'

const projectRoot = join(import.meta.dir, '../../')

const app = new Hono()

app.use(cors())
app.use('/client/public/*', serveStatic({ root: projectRoot }))

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Baybayin Drawing Data Gatherer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="/client/public/css/baybayin.css" rel="stylesheet">
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="/client/public/js/bundle.js"></script>
      </body>
    </html>
  `)
})

app.get('/hello', async (c) => {

  const data: ApiResponse = {
    message: "Hello BHVR!",
    success: true
  }

  return c.json(data, { status: 200 })
})

export default {
  port: 8887,
  fetch: app.fetch,
}