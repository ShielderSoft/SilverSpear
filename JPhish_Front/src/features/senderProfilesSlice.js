import { createSlice } from '@reduxjs/toolkit'

const senderProfilesSlice = createSlice({
  name: 'senderProfiles',
  initialState: {
    selectedProfile: null,
  },
  reducers: {
    selectSenderProfile: (state, action) => {
      state.selectedProfile = action.payload
    },
  },
})

export const { selectSenderProfile } = senderProfilesSlice.actions
export default senderProfilesSlice.reducer