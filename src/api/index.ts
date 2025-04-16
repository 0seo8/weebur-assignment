import axios from 'axios';

const BASE_URL = 'https://dummyjson.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (response) => response,
  (error) => {
    console.error('API 요청 실패', error.message);

    if (error.response) {
      console.error('서버 오류:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('네트워크 오류: 서버로부터 응답이 없습니다');
    } else {
      console.error('요청 오류:', error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
