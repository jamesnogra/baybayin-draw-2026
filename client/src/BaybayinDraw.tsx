import { useRef, useEffect, useState } from 'react'

export default function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const canvas10Ref = useRef<HTMLCanvasElement>(null)
    const canvas5Ref = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)

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
            ctx.lineWidth = 20
            ctx.strokeStyle = '#000';

            // Initialize the other canvases
            [canvas10Ref, canvas5Ref].forEach((ref, idx) => {
                const c = ref.current
                if (!c) return
                const context = c.getContext('2d')
                if (!context) return
                
                c.width = rect.width
                c.height = rect.height
                context.lineCap = 'round'
                context.lineJoin = 'round'
                context.lineWidth = idx === 0 ? 10 : 5
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
        [canvasRef, canvas10Ref, canvas5Ref].forEach(ref => {
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
        [canvasRef, canvas10Ref, canvas5Ref].forEach(ref => {
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
        [canvasRef, canvas10Ref, canvas5Ref].forEach(ref => {
            const canvas = ref.current
            if (!canvas) return
            const ctx = canvas.getContext('2d')
            if (!ctx) return
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        })
    }

    const submitCanvas = () => {
        // Do not add movement too much if in mobile view
        const additionalPixelsToMove = window.innerWidth < 768 ? 0 : 10
        shiftCanvas(canvas10Ref, -5-additionalPixelsToMove, -5-additionalPixelsToMove)
        shiftCanvas(canvas5Ref, 10+additionalPixelsToMove, 10+additionalPixelsToMove)
    }

    const shiftCanvas = (ref: any, shiftX: number, shiftY: number) => {
        const canvas10 = ref.current
        if (!canvas10) return
        const ctx = canvas10.getContext('2d')
        if (!ctx) return
        // Get the current canvas image data
        const imageData = ctx.getImageData(0, 0, canvas10.width, canvas10.height)
        // Clear the canvas
        ctx.clearRect(0, 0, canvas10.width, canvas10.height)
        // Draw the image data shifted
        ctx.putImageData(imageData, shiftX, shiftY)
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
            <canvas ref={canvas10Ref} className="baybayin-main-canvas baybayin-hide-canvas" />
            <canvas ref={canvas5Ref} className="baybayin-main-canvas baybayin-hide-canvas" />
            <div className="baybayin-draw-buttons">
                <button className="btn btn-success btn-lg" onClick={submitCanvas}>Submit</button>
                <button className="btn btn-warning btn-lg" onClick={clearCanvas}>Clear</button>
            </div>
        </div>
    )
}