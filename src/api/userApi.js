import api from './config'

export default {
  getAll() {
    return api.get('usuarios/')
  },
  delete(id) {
    return api.delete(`usuarios/${id}/`)
  },
  setGroup(id, group) {
    return api.post(`usuarios/${id}/grupo/`, { group })
  },
}
