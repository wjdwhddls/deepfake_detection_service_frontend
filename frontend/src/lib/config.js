// frontend/src/lib/config.js
import axios from 'axios';

export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  'http://ec2-43-200-224-84.ap-northeast-2.compute.amazonaws.com:3000';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터: 토큰 자동 첨부 (웹은 localStorage 사용)
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (_) {}
  return config;
});

// 응답 인터셉터: 에러 메시지 통일
api.interceptors.response.use(
  (res) => res,
  (err) => {
    let message = '네트워크 오류가 발생했습니다.';
    if (err.response?.data) {
      const d = err.response.data;
      if (typeof d === 'string') message = d;
      else if (Array.isArray(d)) message = d.join(', ');
      else if (typeof d === 'object') message = Object.values(d).join(', ');
    } else if (err.message) {
      message = err.message;
    }
    return Promise.reject({ ...err, friendlyMessage: message });
  }
);