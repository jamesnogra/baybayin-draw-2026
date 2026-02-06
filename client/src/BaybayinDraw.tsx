import { useRef, useEffect, useState } from 'react'

type BaybayinSampleImagesProps = {
    letter: string;
};

export default function App({ letter }: BaybayinSampleImagesProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const canvas7Ref = useRef<HTMLCanvasElement>(null)
    const canvas5Ref = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        // Wait a tick for CSS to apply
        setTimeout(() => {
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            // Get the actual rendered size
            const rect = canvas.getBoundingClientRect()

            // Set canvas internal resolution to match display size
            canvas.width = rect.width
            canvas.height = rect.height

            // Configure drawing style
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.lineWidth = 10
            ctx.strokeStyle = '#000';

            // Initialize the other canvases
            [canvas7Ref, canvas5Ref].forEach((ref, idx) => {
                const c = ref.current
                if (!c) return
                const context = c.getContext('2d')
                if (!context) return
                
                c.width = rect.width
                c.height = rect.height
                context.lineCap = 'round'
                context.lineJoin = 'round'
                context.lineWidth = idx === 0 ? 7 : 5
                context.strokeStyle = '#000'
            })
        }, 0)
    }, [])

    const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return null
        
        const rect = canvas.getBoundingClientRect()
        
        if ('touches' in e) {
            // Touch event
            const touch = e.touches[0]
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            }
        } else {
            // Mouse event
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            }
        }
    }

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        //e.preventDefault() // Prevent scrolling on touch
        const coords = getCoordinates(e)
        if (!coords) return

        // Start path on all three canvases
        [canvasRef, canvas7Ref, canvas5Ref].forEach(ref => {
            const c = ref.current
            if (!c) return
            const ctx = c.getContext('2d')
            if (!ctx) return
            ctx.beginPath()
            ctx.moveTo(coords.x, coords.y)
        })
        
        setIsDrawing(true)
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return
        //e.preventDefault() // Prevent scrolling on touch

        const coords = getCoordinates(e)
        if (!coords) return

        // Draw on all three canvases
        [canvasRef, canvas7Ref, canvas5Ref].forEach(ref => {
            const c = ref.current
            if (!c) return
            const ctx = c.getContext('2d')
            if (!ctx) return
            ctx.lineTo(coords.x, coords.y)
            ctx.stroke()
        })
    }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    const clearCanvas = () => {
        [canvasRef, canvas7Ref, canvas5Ref].forEach(ref => {
            const canvas = ref.current
            if (!canvas) return
            const ctx = canvas.getContext('2d')
            if (!ctx) return
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        })
    }

    const randomPixelsToShift = () => {
        return Math.floor(Math.random() * 21) - 10
    }

    const randomAngle = () => {
        return Math.floor(Math.random() * 11) - 5
    }

    const submitCanvas = async () => {
        // Do not add movement too much if in mobile view
        const additionalPixelsToMove = window.innerWidth < 768 ? 0 : 10
        shiftCanvas(canvas7Ref, randomPixelsToShift()-additionalPixelsToMove, randomPixelsToShift()-additionalPixelsToMove, randomAngle())
        shiftCanvas(canvas5Ref, randomPixelsToShift()+additionalPixelsToMove, randomPixelsToShift()+additionalPixelsToMove, randomAngle())

        setUploading(true)
        
        try {
            const canvasMain = canvasRef.current?.toDataURL('image/png')
            const canvas7 = canvas7Ref.current?.toDataURL('image/png')
            const canvas5 = canvas5Ref.current?.toDataURL('image/png')

            const response = await fetch('/upload-canvas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    canvasMain,
                    canvas7,
                    canvas5,
                    letter
                })
            })

            const result = await response.json()
            
            if (result.success) {
                clearCanvas()
            } else {
                alert('Upload failed: ' + result.message)
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert('Upload failed')
        } finally {
            setUploading(false)
            window.location.reload()
        }
    }

    const shiftCanvas = (ref: any, shiftX: number, shiftY: number, angleDegrees: number = 45) => {
        const currentCanvas = ref.current
        if (!currentCanvas) return
        const ctx = currentCanvas.getContext('2d')
        if (!ctx) return
        
        // Get the current canvas image data
        const imageData = ctx.getImageData(0, 0, currentCanvas.width, currentCanvas.height)
        
        // Create a temporary canvas to hold the original image
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = currentCanvas.width
        tempCanvas.height = currentCanvas.height
        const tempCtx = tempCanvas.getContext('2d')
        if (!tempCtx) return
        tempCtx.putImageData(imageData, 0, 0)
        
        // Clear the main canvas
        ctx.clearRect(0, 0, currentCanvas.width, currentCanvas.height)
        
        // Apply transformations
        ctx.save()
        
        // Move to center, rotate, then move back
        const centerX = currentCanvas.width / 2
        const centerY = currentCanvas.height / 2
        ctx.translate(centerX + shiftX, centerY + shiftY)
        ctx.rotate((angleDegrees * Math.PI) / 180)
        ctx.translate(-centerX, -centerY)
        
        // Draw the rotated image
        ctx.drawImage(tempCanvas, 0, 0)
        
        ctx.restore()
    }

    return (
        <div className="baybayin-draw-container">
            <canvas
                ref={canvasRef}
                className="baybayin-main-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
            <canvas ref={canvas7Ref} className="baybayin-main-canvas baybayin-hide-canvas" />
            <canvas ref={canvas5Ref} className="baybayin-main-canvas baybayin-hide-canvas" />
            <div className="baybayin-draw-buttons">
                <button className="btn btn-success btn-lg" onClick={submitCanvas} disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Submit'}
                </button>
                <button className="btn btn-warning btn-lg" onClick={clearCanvas}>Clear</button>
                <a href="/manage" className="btn btn-secondary btn-lg">Manage</a>
            </div>
        </div>
    )
}