import api from "./config";

const messageApi = {
    getAll() {
        return api.get('recados/')
    },
    getMessageById(id) {
        return api.get(`recados/${id}/`)
    },
    createMessage(data) {
        return api.post(`recados/`, data)
    },
    updateMessage(id, data) {
        return api.put(`recados/${id}/`, data)
    },
    delete(id) {
        return api.delete(`recados/${id}/`)
    }
}

export default messageApi