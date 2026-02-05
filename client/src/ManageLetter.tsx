import { useState, useEffect } from 'react'

interface Image {
  filename: string
  url: string
  timestamp: string
}

interface ImageGalleryProps {
  letter: string
}

export default function ImageGallery({ letter }: ImageGalleryProps) {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchImages()
  }, [letter])

  const fetchImages = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/images/${letter}`)
      const data = await response.json()
      
      if (data.success) {
        setImages(data.images || [])
      } else {
        setImages([])
      }
    } catch (error) {
      console.error('Error fetching images:', error)
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  const deleteImage = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return
    }

    setDeleting(filename)
    try {
      const response = await fetch(`/images/${letter}/${filename}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setImages(images.filter(img => img.filename !== filename))
        alert('Image deleted successfully!')
      } else {
        alert('Failed to delete image: ' + data.message)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete image')
    } finally {
      setDeleting(null)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp))
    return date.toLocaleString()
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading images...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gallery for Letter: <span className="text-primary">{letter}</span></h1>
        <a href="/draw" className="btn btn-primary">
          Back to Drawing
        </a>
      </div>

      {images.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <h4 className="alert-heading">No images yet</h4>
          <p>No images have been uploaded for the letter "{letter}" yet.</p>
          <hr />
          <p className="mb-0">
            <a href={`/draw/${letter}`} className="btn btn-primary">Start Drawing</a>
          </p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
          {images.map((image) => (
            <div key={image.filename} className="col">
              <div className="card h-100 shadow-sm">
                <img 
                  src={image.url} 
                  className="card-img-top" 
                  alt={image.filename}
                  style={{ height: '250px', objectFit: 'contain', backgroundColor: '#f8f9fa' }}
                />
                <div className="card-body">
                  <p className="card-text text-muted small mb-2">
                    {formatTimestamp(image.timestamp)}
                  </p>
                  <p className="card-text small text-truncate" title={image.filename}>
                    {image.filename}
                  </p>
                </div>
                <div className="card-footer bg-transparent">
                  <button
                    className="btn btn-danger btn-sm w-100"
                    onClick={() => deleteImage(image.filename)}
                    disabled={deleting === image.filename}
                  >
                    {deleting === image.filename ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Deleting...
                      </>
                    ) : (
                      <>Delete</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 mb-4">
        <p className="text-muted">Total images: {images.length}</p>
      </div>
    </div>
  )
}