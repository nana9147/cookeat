import { create } from 'zustand'
import type { AuthUser } from '@/services/auth/authService'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  keepLogin: boolean
  _hydrated: boolean
  setAuth: (accessToken: string, refreshToken: string, user: AuthUser, keepLogin?: boolean) => void
  patchUser: (patch: Partial<AuthUser>) => void
  clearAuth: () => void
  rehydrate: () => void
}

const STORAGE_KEY = 'auth'
type StoredAuth = { accessToken: string; refreshToken: string; user: AuthUser }

function writeStorage(data: StoredAuth, keepLogin: boolean) {
  const value = JSON.stringify(data)
  if (keepLogin) {
    localStorage.setItem(STORAGE_KEY, value)
    sessionStorage.removeItem(STORAGE_KEY)
  } else {
    sessionStorage.setItem(STORAGE_KEY, value)
    localStorage.removeItem(STORAGE_KEY)
  }
}

function readStorage(): (StoredAuth & { keepLogin: boolean }) | null {
  try {
    const local = localStorage.getItem(STORAGE_KEY)
    if (local) {
      const parsed = JSON.parse(local)
      // Zustand persist 구형 포맷 호환 (state 래퍼)
      const data = parsed?.state ?? parsed
      if (data?.accessToken && data?.refreshToken && data?.user) {
        return { accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user, keepLogin: true }
      }
    }
    const session = sessionStorage.getItem(STORAGE_KEY)
    if (session) {
      const data = JSON.parse(session)
      if (data?.accessToken && data?.refreshToken && data?.user) {
        return { ...data, keepLogin: false }
      }
    }
  } catch {
    // SSR 또는 storage 접근 불가 환경
  }
  return null
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  keepLogin: false,
  _hydrated: false,
  setAuth: (accessToken, refreshToken, user, keepLogin) => {
    const kl = keepLogin ?? get().keepLogin
    set({ accessToken, refreshToken, user, keepLogin: kl })
    writeStorage({ accessToken, refreshToken, user }, kl)
  },
  patchUser: (patch) => {
    set((state) => {
      const user = state.user ? { ...state.user, ...patch } : null
      if (user && state.accessToken && state.refreshToken) {
        writeStorage({ accessToken: state.accessToken, refreshToken: state.refreshToken, user }, state.keepLogin)
      }
      return { user }
    })
  },
  clearAuth: () => {
    clearStorage()
    set({ accessToken: null, refreshToken: null, user: null, keepLogin: false })
  },
  rehydrate: () => {
    const stored = readStorage()
    if (stored) {
      set({
        accessToken: stored.accessToken,
        refreshToken: stored.refreshToken,
        user: stored.user,
        keepLogin: stored.keepLogin,
        _hydrated: true,
      })
    } else {
      set({ _hydrated: true })
    }
  },
}))
