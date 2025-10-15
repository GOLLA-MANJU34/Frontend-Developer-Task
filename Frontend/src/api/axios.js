import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000', // backend URL
})

// Attach token automatically to requests
API.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default API
