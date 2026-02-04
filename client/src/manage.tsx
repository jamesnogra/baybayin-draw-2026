import { createRoot } from 'react-dom/client'
import ManageLetter from '../../client/src/ManageLetter'

const root = document.getElementById('root')
const letter = root?.getAttribute('data-letter') || 'A'

if (root) {
  createRoot(root).render(<ManageLetter letter={letter} />)
}