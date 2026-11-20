import api from './config'
import axios from 'axios'
import { useTemplateStore } from '@/stores/templateStore'

// O cliente é criado na primeira requisição, após a inicialização dos módulos.
// Ele não envia tokens antigos nem executa o interceptor de refresh.
let authClient

function getAuthClient() {
  if (!authClient) {
    authClient = axios.create({ baseURL: api.defaults.baseURL })
    authClient.interceptors.request.use(config => {
      useTemplateStore().beginLoading()
      return config
    })
    authClient.interceptors.response.use(
      response => {
        useTemplateStore().endLoading()
        return response
      },
      error => {
        useTemplateStore().endLoading()
        return Promise.reject(error)
      },
    )
  }
  return authClient
}

export default {
  login({ email, password }) {
    return getAuthClient().post('token/', { email, password })
  },
  register({ email, name, password, accept_terms, accept_privacy }) {
    return getAuthClient().post('registro/', { email, name, password, accept_terms, accept_privacy })
  },
  refresh({ refresh }) {
    return getAuthClient().post('token/refresh/', { refresh })
  },
  me() {
    return api.get('usuarios/me/')
  },
}
