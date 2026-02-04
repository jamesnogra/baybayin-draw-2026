import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/bun'
import { join } from 'path'
import { mkdir, readdir, unlink } from 'fs/promises'
import type { ApiResponse } from 'shared/dist'
import letters from '../../client/src/letters'

const projectRoot = join(import.meta.dir, '../../')
const uploadsDir = join(projectRoot, 'client/public/uploads')
// Ensure uploads directory exists
await mkdir(uploadsDir, { recursive: true })

const app = new Hono()

app.use(cors())
app.use('/client/public/*', serveStatic({ root: projectRoot }))
app.use('/client/public/uploads/*', serveStatic({ root: projectRoot }))

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

app.get('/manage/:letter', (c) => {
  const letter = c.req.param('letter')
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Manage Letter ${letter} - Baybayin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="/client/public/css/baybayin.css" rel="stylesheet">
      </head>
      <body>
        <div id="root" data-letter="${letter}"></div>
        <script type="module" src="/client/public/js/manage-bundle.js"></script>
      </body>
    </html>
  `)
})

app.get('/manage', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Manage All Letters - Baybayin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="/client/public/css/baybayin.css" rel="stylesheet">
      </head>
      <body>
        <div class="container mt-5">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>Manage Baybayin Letters</h1>
            <a href="/" class="btn btn-primary">Back to Drawing</a>
          </div>
          <div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
            ${letters.map(letter => `
              <div class="col">
                <a href="/manage/${letter}" class="btn btn-outline-primary w-100 py-3">
                  <strong>${letter}</strong>
                </a>
              </div>
            `).join('')}
          </div>
        </div>
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

// Get list of images for a specific letter
app.get('/images/:letter', async (c) => {
  try {
    const letter = c.req.param('letter')
    const letterDir = join(uploadsDir, letter)
    
    try {
      const files = await readdir(letterDir)
      const imageFiles = files.filter(f => f.endsWith('.png'))
      
      const images = imageFiles.map(filename => ({
        filename,
        url: `/client/public/uploads/${letter}/${filename}`,
        timestamp: filename.match(/\d+/)?.[0] || ''
      }))
      
      // Sort by timestamp (newest first)
      images.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp))
      
      return c.json({
        success: true,
        letter,
        images
      })
    } catch (error) {
      return c.json({
        success: false,
        message: 'Letter directory not found',
        images: []
      })
    }
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error fetching images'
    }, 500)
  }
})

// Delete a specific image
app.delete('/images/:letter/:filename', async (c) => {
  try {
    const letter = c.req.param('letter')
    const filename = c.req.param('filename')
    const filepath = join(uploadsDir, letter, filename)
    
    await unlink(filepath)
    
    return c.json({
      success: true,
      message: 'Image deleted successfully'
    })
  } catch (error) {
    console.error('Delete error:', error)
    return c.json({
      success: false,
      message: 'Failed to delete image'
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