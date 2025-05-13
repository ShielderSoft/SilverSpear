import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../features/authSlice'
import apiClient from '../apiClient'
import Background from '../components/Background'
import { motion } from 'framer-motion'

function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [role, setRole] = useState('admin')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      const endpoint = role === 'admin'
        ? '/admin/adlog'
        : '/clients/login'

      const response = await apiClient.post(
        endpoint,
        { email, password },
        { responseType: role === 'admin' ? 'text' : 'json' }
      )

      let token, user = null

      if (role === 'admin') {
        // admin returns plain text
        token = response.data
      } else {
        // client returns { clientName, clientCompany, token }
        const { clientName, clientCompany, token: t } = response.data
        token = t
        user  = { clientName, clientCompany }
      }

      dispatch(setCredentials({ token, role, user }))
      navigate('/')
    } catch (err) {
      setError('Login failed. Please check your credentials.')
    }
  }

  return (
    <>
      <Background />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative min-h-screen flex items-center justify-center"
      >
        <div className="relative z-10 bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md">
          <h2 className="text-3xl font-extrabold mb-6 text-center text-white">
            Welcome Back
          </h2>

          {/* Role Toggle */}
          <div className="relative flex bg-gray-700 rounded-full p-1 mb-8">
            <motion.div
              className="absolute bg-blue-600 rounded-full h-10 w-1/2"
              animate={{ x: role === 'admin' ? 0 : '100%' }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
            {['admin', 'client'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`relative flex-1 text-center py-2 font-medium transition-colors ${
                  role === r ? 'text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {error && (
            <motion.p
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-red-500 mb-4 text-center"
            >
              {error}
            </motion.p>
          )}

          {/* 3D Flip Card */}
          <div className="mt-4" style={{ perspective: 1000 }}>
            <motion.div
              animate={{ rotateY: role === 'admin' ? 0 : 180 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              style={{
                position: 'relative',
                transformStyle: 'preserve-3d',
                width: '100%',
                minHeight: '220px'
              }}
            >
              {/* Admin Face */}
              <form
                onSubmit={handleSubmit}
                style={{
                  backfaceVisibility: 'hidden',
                  position: 'absolute',
                  width: '100%',
                  top: 0,
                  left: 0
                }}
              >
                <label className="block mb-4 text-gray-200">
                  Email
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full mt-1 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
                <label className="block mb-6 text-gray-200">
                  Password
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full mt-1 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-md font-bold uppercase tracking-wide transition-transform transform hover:scale-105"
                >
                  Admin Login
                </button>
              </form>

              {/* Client Face */}
              <form
                onSubmit={handleSubmit}
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  position: 'absolute',
                  width: '100%',
                  top: 0,
                  left: 0
                }}
              >
                <label className="block mb-4 text-gray-200">
                  Email
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full mt-1 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
                <label className="block mb-6 text-gray-200">
                  Password
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full mt-1 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-md font-bold uppercase tracking-wide transition-transform transform hover:scale-105"
                >
                  Client Login
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default Login