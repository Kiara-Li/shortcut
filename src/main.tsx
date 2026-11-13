import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { isCelebration, isOverlay } from './bridge/desktop'
import './index.css'

if (isOverlay || isCelebration) document.documentElement.dataset.overlay = 'true'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
