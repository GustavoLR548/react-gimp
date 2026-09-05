import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppRoot } from './AppRoot'
import '../react/styles.css'

const root = document.getElementById('root')
if (!root) throw new Error('[gimp] #root element not found.')

createRoot(root).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
)
