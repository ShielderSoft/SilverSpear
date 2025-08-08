import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App-debug'
import './index.css'

console.log('Starting React app...')

if (typeof global === "undefined" && typeof window !== "undefined") {
  window.global = window
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
