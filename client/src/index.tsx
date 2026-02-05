import { createRoot } from 'react-dom/client'
import BaybayinMainCanvas from './BaybayinMainCanvas'

const root = document.getElementById('root')
const letter = root?.getAttribute('data-letter') || ''

if (root) {
    createRoot(root).render(<BaybayinMainCanvas letter={letter} />)
}