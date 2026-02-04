import BaybayinSampleImages from './BaybayinSampleImages'
import BaybayinDraw from './BaybayinDraw'
import letters from './letters'

export default function App() {
    const randomLetter = letters[Math.floor(Math.random() * letters.length)]

    return (
        <div className="baybayin-main-container">
            <div className={`baybayin-auto-height baybayin-sample-container`}>
                <BaybayinSampleImages letter={randomLetter} />
            </div>
            <div className={`baybayin-auto-height baybayin-main-draw-container`}>
                <BaybayinDraw letter={randomLetter} />
            </div>
        </div>
    )
}