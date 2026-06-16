// 모든 API 호출의 베이스 인스턴스. 인증이 필요한 엔드포인트에 Bearer 토큰을 자동으로 첨부한다.
import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import type { AuthUser } from '@/services/auth/authTypes'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config

    if (err.response?.status === 401 && !originalRequest._retry) {
      const { refreshToken } = useAuthStore.getState()

      if (!refreshToken) {
        const data = err.response?.data
        const message = data?.error ?? err.message
        return Promise.reject(Object.assign(new Error(message), { data }))
      }

      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise<string>((resolve) => {
          refreshQueue.push(resolve)
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      isRefreshing = true

      try {
        // /api/auth/refresh를 경유하면 서버에서 httpOnly 쿠키도 함께 갱신된다.
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        if (!res.ok) throw new Error('refresh failed')

        const { accessToken, refreshToken: newRefreshToken, user } = (await res.json()) as {
          accessToken: string
          refreshToken: string
          user: AuthUser
        }

        const resolvedUser = user ?? useAuthStore.getState().user
        if (!resolvedUser) throw new Error('no user after refresh')
        useAuthStore.getState().setAuth(accessToken, newRefreshToken, resolvedUser)

        refreshQueue.forEach((cb) => cb(accessToken))
        refreshQueue = []

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch {
        refreshQueue = []
        useAuthStore.getState().clearAuth()
        if (typeof window !== 'undefined') window.location.href = '/login'
        const data = err.response?.data
        const message = data?.error ?? err.message
        return Promise.reject(Object.assign(new Error(message), { data }))
      } finally {
        isRefreshing = false
      }
    }

    const data = err.response?.data
    const message = data?.error ?? err.message
    return Promise.reject(Object.assign(new Error(message), { data }))
  },
)

export default api
