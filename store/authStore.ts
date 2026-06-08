import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/services/auth/authService'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  _hydrated: boolean
  setAuth: (accessToken: string, refreshToken: string, user: AuthUser) => void
  patchUser: (patch: Partial<AuthUser>) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      _hydrated: false,
      setAuth: (accessToken, refreshToken, user) => set({ accessToken, refreshToken, user }),
      patchUser: (patch) => set((state) => ({ user: state.user ? { ...state.user, ...patch } : null })),
      clearAuth: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: 'auth',
      onRehydrateStorage: () => (state) => { if (state) state._hydrated = true },
    },
  ),
)
