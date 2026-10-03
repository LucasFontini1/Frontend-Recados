import api from "./config";

const pastoralApi = {
    getAll() {
        return api.get('pastorais/')
    },
    createPastoral(data) {
        return api.post('pastorais/', data)
    },
    getPastoralById(id) {
        return api.get(`pastorais/${id}/`)
    },
    updatePastoral(data, id) {
        return api.put(`pastorais/${id}/`, data)
    },
    delete(id) {
        return api.delete(`pastorais/${id}/`)
    }
}

export default pastoralApi