import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './App.scss'
import { BrowserRouter } from 'react-router-dom'
import { RecoilRoot } from 'recoil';
import { HelmetProvider } from 'react-helmet-async'

createRoot(document.getElementById('root')).render(
  <RecoilRoot>
    <BrowserRouter>
      <StrictMode>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </StrictMode>
    </BrowserRouter>
  </RecoilRoot>
)
