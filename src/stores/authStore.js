import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { jwtDecode } from 'jwt-decode'
import authApi from '@/api/authApi'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('access_token'))
  const refreshToken = ref(localStorage.getItem('refresh_token'))
  const user = ref(null)
  const isAuthenticated = computed(() => !!accessToken.value)
  let refreshRequest = null

  function logout() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  function saveTokens({ access, refresh }) {
    const payload = jwtDecode(access)
    if (!payload.exp || payload.exp * 1000 <= Date.now()) {
      throw new Error('A sessão recebida é inválida. Entre novamente.')
    }
    accessToken.value = access
    localStorage.setItem('access_token', access)
    if (refresh) {
      refreshToken.value = refresh
      localStorage.setItem('refresh_token', refresh)
    }
  }

  async function refreshUserProfile() {
    const { data } = await authApi.me()
    user.value = data
    return data
  }

  async function login(credentials) {
    const { data } = await authApi.login(credentials)
    try {
      if (!data.refresh) throw new Error('A API não retornou uma sessão válida.')
      saveTokens(data)
      await refreshUserProfile()
    } catch (error) {
      logout()
      throw error
    }
  }

  async function register(userData) {
    const { data } = await authApi.register(userData)
    return data
  }

  async function refreshAccessToken() {
    if (refreshRequest) return refreshRequest
    refreshRequest = (async () => {
      try {
        if (!refreshToken.value) throw new Error('Sua sessão expirou. Entre novamente.')
        const { data } = await authApi.refresh({ refresh: refreshToken.value })
        saveTokens(data)
        return data.access
      } catch (error) {
        logout()
        throw error
      }
    })()
    try {
      return await refreshRequest
    } finally {
      refreshRequest = null
    }
  }

  async function refreshUserSession() {
    if (!accessToken.value && !refreshToken.value) return
    let expired = true
    try {
      expired = !(jwtDecode(accessToken.value).exp * 1000 > Date.now())
    } catch {
      // Uma sessão incompleta pode ser recuperada pelo refresh token.
    }
    if (expired) await refreshAccessToken()
    return refreshUserProfile()
  }

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    login,
    register,
    logout,
    refreshAccessToken,
    refreshUserSession,
    refreshUserProfile,
  }
})
