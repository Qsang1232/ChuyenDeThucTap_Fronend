
import axiosClient from "./axiosClient";

// Cấu hình axios cơ bản (hoặc import axiosClient có sẵn của bạn)


const aiApi = {
    chat: (question) => {

        return axiosClient.post('/ai/chat', { question });
    }
};

export default aiApi;
