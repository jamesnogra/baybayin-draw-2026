import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/bun'
import { join } from 'path'
import { mkdir, readdir, unlink } from 'fs/promises'
import type { ApiResponse } from 'shared/dist'
import sharp from 'sharp'
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
        <h1 class="text-center">Baybayin Drawing Data Gatherer</h1>
        <div class="text-center"><a href="/draw" class="btn btn-primary btn-lg">Start Drawing</a></div>
      </body>
    </html>
  `)
})

app.get('/draw/:letter?', (c) => {
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
        <div id="root" data-letter="${c.req.param('letter') || ''}"></div>
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
      </head>
      <body>
        <div class="container mt-5">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>Manage Baybayin Letters</h1>
            <a href="/download-all" class="btn btn-success me-2" download>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
              </svg>
              Download All
            </a>
            <a href="/draw" class="btn btn-primary">Back to Drawing</a>
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
    
    // Convert base64 to buffer, resize, and save
    const saveImage = async (base64Data: string, suffix: string) => {
      // Remove data:image/png;base64, prefix
      const base64Image = base64Data.replace(/^data:image\/png;base64,/, '')
      const buffer = Buffer.from(base64Image, 'base64')
      
      // Resize image to 256x256
      const resizedBuffer = await sharp(buffer)
        .resize(256, 256, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 } // white background
        })
        .png()
        .toBuffer()
      
      const filename = `canvas_${suffix}_${timestamp}.png`
      const filepath = join(`${uploadsDir}/${letter}`, filename)
      await Bun.write(filepath, resizedBuffer)
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

app.get('/download-all', async (c) => {
  try {
    const { spawn } = require('child_process');
    
    // Check if uploads directory exists and has content
    try {
      const files = await readdir(uploadsDir)
      if (files.length === 0) {
        return c.json({ 
          success: false, 
          message: 'No files to download' 
        }, 404)
      }
    } catch (error) {
      return c.json({ 
        success: false, 
        message: 'Uploads directory not found' 
      }, 404)
    }
    
    // Create a temporary zip file
    const zipPath = join(projectRoot, `uploads-${Date.now()}.zip`)
    
    // Use system zip command to create the archive
    await new Promise((resolve, reject) => {
      // Change to uploads directory and zip everything inside it
      const zip = spawn('zip', ['-r', zipPath, '.'], {
        cwd: uploadsDir
      })
      
      let stderr = ''
      
      zip.stderr.on('data', (data: Buffer) => {
        stderr += data.toString()
      })
      
      zip.on('close', (code: number) => {
        if (code === 0) {
          resolve(true)
        } else {
          reject(new Error(`Zip process exited with code ${code}: ${stderr}`))
        }
      })
      
      zip.on('error', (err: Error) => {
        reject(err)
      })
    })
    
    // Read the zip file
    const zipFile = Bun.file(zipPath)
    const buffer = await zipFile.arrayBuffer()
    
    // Clean up the temporary zip file
    await unlink(zipPath)
    
    // Send the zip file
    return c.body(buffer, 200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="baybayin-uploads-${Date.now()}.zip"`
    })
    
  } catch (error) {
    console.error('Download error:', error)
    return c.json({ 
      success: false, 
      message: 'Failed to create download: ' + (error as Error).message 
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