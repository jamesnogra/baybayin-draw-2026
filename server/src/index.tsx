import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderToString } from 'react-dom/server'
import App from 'client/src/App'
import type { ApiResponse } from 'shared/dist'

const app = new Hono()

app.use(cors())

app.get('/', (c) => {
  const html = renderToString(<App name="James" />)
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bun Hono React</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body>
        <div>FROM MAIN TOP</div>
        <div id="root">${html}</div>
        <div>FROM MAIN BOTTOM</div>
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