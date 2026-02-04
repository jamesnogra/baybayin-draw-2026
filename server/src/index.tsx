import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/bun'
import { join } from 'path'
import { mkdir } from 'fs/promises'
import type { ApiResponse } from 'shared/dist'

const projectRoot = join(import.meta.dir, '../../')
const uploadsDir = join(projectRoot, 'client/public/uploads')
// Ensure uploads directory exists
await mkdir(uploadsDir, { recursive: true })

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

app.post('/upload-canvas', async (c) => {
  try {
    const body = await c.req.json()
    const { canvasMain, canvas7, canvas5, letter } = body

    if (!canvasMain || !canvas7 || !canvas5) {
      return c.json({ 
        success: false, 
        message: 'Missing canvas data' 
      }, 400)
    }

    // Generate timestamp for unique filenames
    const timestamp = Date.now()

    // Create letter-specific directory
    await mkdir(`${uploadsDir}/${letter}`, { recursive: true })
    
    // Convert base64 to buffer and save
    const saveImage = async (base64Data: string, suffix: string) => {
      // Remove data:image/png;base64, prefix
      const base64Image = base64Data.replace(/^data:image\/png;base64,/, '')
      const buffer = Buffer.from(base64Image, 'base64')
      const filename = `canvas_${suffix}_${timestamp}.png`
      const filepath = join(`${uploadsDir}/${letter}`, filename)
      await Bun.write(filepath, buffer)
      return filename
    }

    const filenameMain = await saveImage(canvasMain, 'main')
    const filename7 = await saveImage(canvas7, '7')
    const filename5 = await saveImage(canvas5, '5')

    return c.json({
      success: true,
      message: 'Canvases uploaded successfully',
      files: {
        main: filenameMain,
        canvas7: filename7,
        canvas5: filename5
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ 
      success: false, 
      message: 'Upload failed' 
    }, 500)
  }
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