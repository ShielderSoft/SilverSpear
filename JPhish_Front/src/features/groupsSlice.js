import { createSlice } from '@reduxjs/toolkit'

export const groupsSlice = createSlice({
  name: 'groups',
  initialState: {
    selectedGroup: null,
  },
  reducers: {
    selectGroup: (state, action) => {
      state.selectedGroup = action.payload
    },
  },
})

export const { selectGroup } = groupsSlice.actions

export default groupsSlice.reducer