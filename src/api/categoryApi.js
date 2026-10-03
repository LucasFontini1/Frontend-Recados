import api from "./config";

const categoryApi = {
    getAll() {
        return api.get('categorias/')
    },
    createCategory(data) {
        return api.post(`categorias/`, data)
    },
    getCategoryById(id) {
        return api.get(`categorias/${id}/`)
    },
    updateCategory(id, data) {
        return api.put(`categorias/${id}/`, data)
    },
    delete(id) {
        return api.delete(`categorias/${id}/`)
    }
}

export default categoryApi