import { createSlice } from '@reduxjs/toolkit'

const token = localStorage.getItem('jwtToken')
const role  = localStorage.getItem('role')
const user  = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: token || null,
    role:  role  || null,
    user:  user  || null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token
      state.role  = action.payload.role
      state.user  = action.payload.user || null

      localStorage.setItem('jwtToken', state.token)
      localStorage.setItem('role',      state.role)
      if (state.user) {
        localStorage.setItem('user', JSON.stringify(state.user))
      }
    },
    logout: (state) => {
      state.token = null
      state.role  = null
      state.user  = null
      localStorage.removeItem('jwtToken')
      localStorage.removeItem('role')
      localStorage.removeItem('user')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions

export default authSlice.reducer