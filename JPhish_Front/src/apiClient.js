import axios from 'axios'
import { API_BASE_URL, BASE_URL, CAMPAIGN_BASE_URL, DETAILS_TRACKER_URL } from './config'


const apiClient = axios.create({
  baseURL: BASE_URL,
})

export const campaignApiClient = axios.create({
  baseURL: CAMPAIGN_BASE_URL,
})

export const detailsTrackerApiClient = axios.create({
  baseURL: DETAILS_TRACKER_URL,
})

export const aiClient = axios.create({
  baseURL: API_BASE_URL,
})
export default apiClient