// 모든 API 호출의 베이스 인스턴스. 인증이 필요한 엔드포인트에 Bearer 토큰을 자동으로 첨부한다.
import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { toAuthUser } from '@/services/auth/authTypes'

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

      // refresh token이 없으면 재시도 불가 — 일반 에러로 처리
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
        const { data, error } = await supabase.auth.refreshSession()
        if (error || !data.session) throw error ?? new Error('refresh failed')

        const { access_token, refresh_token } = data.session
        useAuthStore.getState().setAuth(access_token, refresh_token, toAuthUser(data.user!))

        refreshQueue.forEach((cb) => cb(access_token))
        refreshQueue = []

        originalRequest.headers.Authorization = `Bearer ${access_token}`
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
