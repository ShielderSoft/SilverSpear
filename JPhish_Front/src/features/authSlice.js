import { createSlice } from '@reduxjs/toolkit'

const token = localStorage.getItem('jwtToken')

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: token ? token : null,
    user: null, // add user state if needed
  },
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token
      state.user = action.payload.user || null
      localStorage.setItem('jwtToken', action.payload.token)
    },
    logout: (state) => {
      state.token = null
      state.user = null
      localStorage.removeItem('jwtToken')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions

export default authSlice.reducer