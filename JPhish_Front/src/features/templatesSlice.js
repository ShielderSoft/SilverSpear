import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  emailTemplate: null,
  landingTemplate: null,
}

export const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    selectEmailTemplate: (state, action) => {
      state.emailTemplate = action.payload
    },
    selectLandingTemplate: (state, action) => {
      state.landingTemplate = action.payload
    },
  },
})

export const { selectEmailTemplate, selectLandingTemplate } = templatesSlice.actions

export default templatesSlice.reducer