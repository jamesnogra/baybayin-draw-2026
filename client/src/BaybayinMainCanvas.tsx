import BaybayinSampleImages from './BaybayinSampleImages'
import BaybayinDraw from './BaybayinDraw'

const letters = [
    'a', 'e_i', 'o_u',
    'ba', 'be_bi', 'bo_bu', 'b',
    'ka', 'ke_ki', 'ko_ku', 'k',
    'da', 'de_di', 'do_du', 'd',
    'ga', 'ge_gi', 'go_gu', 'g',
    'ha', 'he_hi', 'ho_hu', 'h',
    'la', 'le_li', 'lo_lu', 'l',
    'ma', 'me_mi', 'mo_mu', 'm',
    'na', 'ne_ni', 'no_nu', 'n',
    'nga', 'nge_ngi', 'ngo_ngu', 'ng',
    'pa', 'pe_pi', 'po_pu', 'p',
    'sa', 'se_si', 'so_su', 's',
    'ta', 'te_ti', 'to_tu', 't',
    'wa', 'we_wi', 'wo_wu', 'w',
    'ya', 'ye_yi', 'yo_yu', 'y'
]

export default function App() {
    const randomLetter = letters[Math.floor(Math.random() * letters.length)]

    return (
        <div className="baybayin-main-container">
            <div className={`baybayin-auto-height baybayin-sample-container`}>
                <BaybayinSampleImages letter={randomLetter} />
            </div>
            <div className={`baybayin-auto-height baybayin-main-draw-container`}>
                <BaybayinDraw />
            </div>
        </div>
    )
}