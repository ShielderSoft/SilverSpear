import React from 'react'
import { Routes, Route } from 'react-router-dom'
import BrandingSimple from './pages/BrandingSimple'

console.log('App component loading...')

function App() {
  console.log('App component rendering...')
  
  return (
    <div className="min-h-screen text-white flex flex-col">
      <div className='flex-grow overflow-auto'>
        <Routes>
          <Route path="/" element={<BrandingSimple />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
