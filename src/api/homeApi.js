import api from './config'

export default {
  get() {
    return api.get('home/')
  },
}
