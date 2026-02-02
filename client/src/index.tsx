import { createRoot } from 'react-dom/client'
import BaybayinMainCanvas from './BaybayinMainCanvas'

const root = document.getElementById('root')
if (root) {
    createRoot(root).render(<BaybayinMainCanvas />)
}