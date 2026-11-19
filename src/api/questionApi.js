import api from './config'

export default {
  create(data) {
    return api.post('perguntas/', data)
  },
  getAll() {
    return api.get('perguntas/?page_size=100')
  },
}
