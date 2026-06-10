// 모든 API 호출의 베이스 인스턴스. 인증이 필요한 엔드포인트에 Bearer 토큰을 자동으로 첨부한다.
import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data
    const message = data?.error ?? err.message
    return Promise.reject(Object.assign(new Error(message), { data }))
  },
)

export default api
