import axios from 'axios';

const api = axios.create({
  baseURL: 'https://dummyjson.com',
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API 요청 실패:', error.message);
    return Promise.reject(error);
  },
);

export default api;
