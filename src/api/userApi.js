import api from './config'

export default {
  getAll() {
    return api.get('usuarios/?page_size=100')
  },
  setGroup(id, group) {
    return api.post(`usuarios/${id}/grupo/`, { group })
  },
}
