import axios from 'axios'
import {
  API_BASE_URL,
  BASE_URL,
  CAMPAIGN_BASE_URL,
  DETAILS_TRACKER_URL
} from './config'

const apiClient = axios.create({ baseURL: BASE_URL })
export const campaignApiClient    = axios.create({ baseURL: CAMPAIGN_BASE_URL })
export const detailsTrackerApiClient = axios.create({ baseURL: DETAILS_TRACKER_URL })
export const aiClient             = axios.create({ baseURL: API_BASE_URL })

// helper to attach auth headers
function attachAuthHeaders(client) {
  client.interceptors.request.use(
    (config) => {
      const token     = localStorage.getItem('jwtToken')
      const clearance = localStorage.getItem('role')
      if (token)     config.headers.Authorization = `Bearer ${token}`
      if (clearance) config.headers.clearance    = clearance
      return config
    },
    (error) => Promise.reject(error)
  )
}

// apply to all clients
attachAuthHeaders(apiClient)
attachAuthHeaders(campaignApiClient)
attachAuthHeaders(detailsTrackerApiClient)
attachAuthHeaders(aiClient)

export default apiClient