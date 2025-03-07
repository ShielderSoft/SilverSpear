import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { setCredentials } from '../features/authSlice'
import apiClient from '../apiClient'
import Background from '../components/Background'

function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const response = await apiClient.post(
        '/admin/adlog',
        { email, password },
        { responseType: 'text' }
      )
      const token = response.data
      dispatch(setCredentials({ token }))
      navigate('/')
    } catch (err) {
      setError('Login failed. Please check your credentials.')
    }
  }

  return (
    <>
    <Background />
    <div className="relative min-h-screen flex items-center justify-center">
      
      <div className="relative z-10 bg-gray-800 p-8 rounded-md shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Log In</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            Username:
            <input
              type="text"
              placeholder='Enter your email here...'
              className="w-full p-2 mt-1 rounded bg-gray-700 border-gray-600 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block mb-4">
            Password:
            <input
              type="password"
              placeholder='Enter your password here...'
              className="w-full p-2 mt-1 rounded bg-gray-700 border-gray-600 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold transition-colors"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
    </>
  )
}

export default Login