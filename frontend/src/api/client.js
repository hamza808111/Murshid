import axios from 'axios'

const client = axios.create({
  baseURL: '/', // Vite proxy will forward /api to backend
  withCredentials: true,
})

export default client
