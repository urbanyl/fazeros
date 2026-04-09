import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './contexts/ThemeContext'
import { FileSystemProvider } from './contexts/FileSystemContext'
import { NotificationProvider } from './contexts/NotificationContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <NotificationProvider>
        <FileSystemProvider>
          <App />
        </FileSystemProvider>
      </NotificationProvider>
    </ThemeProvider>
  </StrictMode>,
)
