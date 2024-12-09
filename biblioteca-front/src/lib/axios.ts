import axios from 'axios'
import { useStore } from './store'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useStore.getState().token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default axiosInstance

