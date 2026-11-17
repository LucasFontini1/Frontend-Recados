import api from './config'
import axios from 'axios'

// O cliente é criado na primeira requisição, após a inicialização dos módulos.
// Ele não envia tokens antigos nem executa o interceptor de refresh.
let authClient

function getAuthClient() {
  authClient ??= axios.create({ baseURL: api.defaults.baseURL })
  return authClient
}

export default {
  login({ email, password }) {
    return getAuthClient().post('token/', { email, password })
  },
  register({ email, name, password }) {
    return getAuthClient().post('registro/', { email, name, password })
  },
  refresh({ refresh }) {
    return getAuthClient().post('token/refresh/', { refresh })
  },
  me() {
    return api.get('usuarios/me/')
  },
}
