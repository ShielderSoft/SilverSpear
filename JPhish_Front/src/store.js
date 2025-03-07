import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/authSlice'
import groupsReducer from './features/groupsSlice'
import senderProfilesReducer from './features/senderProfilesSlice'
import templatesReducer from './features/templatesSlice'

export default configureStore({
  reducer: {
    auth: authReducer,
    groups: groupsReducer,
    senderProfiles: senderProfilesReducer,
    templates: templatesReducer,
  },
})