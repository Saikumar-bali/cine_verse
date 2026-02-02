import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './style.css'
import App from './App'

console.log('App loading...')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/cine_verse">
      <App />
    </BrowserRouter>
  </StrictMode>
)
