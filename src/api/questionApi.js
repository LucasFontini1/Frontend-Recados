import api from './config'

export default {
  create(data) {
    return api.post('perguntas/', data)
  },
  getAll() {
    return api.get('perguntas/')
  },
  getMine() {
    return api.get('perguntas/minhas/')
  },
  answer(id, answer) {
    return api.post(`perguntas/${id}/responder/`, { answer })
  },
}
