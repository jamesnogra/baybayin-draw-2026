import BaybayinSampleImages from './BaybayinSampleImages'
import BaybayinDraw from './BaybayinDraw'
import letters from './letters'

interface ImageGalleryProps {
  letter: string
}

export default function App({ letter }: ImageGalleryProps) {
    let currentLetter = letter
    if (currentLetter.length === 0) {
        currentLetter = letters[Math.floor(Math.random() * letters.length)]
    }

    return (
        <div className="baybayin-main-container">
            <div className={`baybayin-auto-height baybayin-sample-container`}>
                <BaybayinSampleImages letter={currentLetter} />
            </div>
            <div class="text-center">Samples</div>
            <div className={`baybayin-auto-height baybayin-main-draw-container`}>
                <BaybayinDraw letter={currentLetter} />
            </div>
        </div>
    )
}