import axiosClient from "./axiosClient";

const categoryApi = {
    getAll: () => {
        return axiosClient.get('/categories');
    }
};

export default categoryApi;