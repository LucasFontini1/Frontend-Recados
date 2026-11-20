import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { useTemplateStore } from '@/stores/templateStore'

const url = import.meta.env.VITE_URL_BACKEND || 'http://127.0.0.1:8000/api/'
const api = axios.create({ baseURL: `${url.replace(/\/+$/, '')}/` })

api.interceptors.request.use((config) => {
  // Requisições de leitura não bloqueiam a interface: cada seção mostra seu skeleton.
  config._blockingLoading = config.method?.toLowerCase() !== 'get'
  if (config._blockingLoading) useTemplateStore().beginLoading()
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => {
    if (response.config?._blockingLoading) useTemplateStore().endLoading()
    return response
  },
  async (error) => {
    if (error.config?._blockingLoading) useTemplateStore().endLoading()
    const request = error.config
    if (error.response?.status !== 401 || !request || request._retry) {
      return Promise.reject(error)
    }
    const auth = useAuthStore()
    if (!auth.refreshToken) {
      auth.logout()
      return Promise.reject(error)
    }
    request._retry = true
    try {
      const token = await auth.refreshAccessToken()
      request.headers.Authorization = `Bearer ${token}`
      return await api(request)
    } catch (refreshError) {
      if (refreshError.response?.status === 401) auth.logout()
      return Promise.reject(refreshError)
    }
  },
)

export default api
