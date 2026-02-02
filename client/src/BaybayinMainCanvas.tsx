import BaybayinSampleImages from './BaybayinSampleImages'
import BaybayinDraw from './BaybayinDraw'

export default function App() {
    return (
        <div className="baybayin-main-container">
            <div className={`baybayin-auto-height baybayin-sample-container`}>
                <BaybayinSampleImages />
            </div>
            <div className={`baybayin-auto-height baybayin-main-draw-container`}>
                <BaybayinDraw />
            </div>
        </div>
    )
}