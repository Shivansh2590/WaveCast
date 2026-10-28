import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // send the httpOnly auth cookie on every request
})

// Also attach a bearer token if one is cached locally, as a fallback
// for environments where third-party cookies get blocked.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wavecast_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.'

export const uploadMedia = async (uploadUrl, file, contentType) => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType || file.type || 'application/octet-stream' },
    body: file,
  })
  if (!response.ok) throw new Error('Media upload failed. Please try again.')
}

export default api
