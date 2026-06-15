// API 라우트를 통해 Supabase 인증을 래핑하는 서비스 레이어
import api from '@/lib/api';
import { toAuthUser, type LoginResult, type RegisterResult } from './authTypes';
export type { AuthUser } from './authTypes';

export const authService = {
  login: async (email: string, password: string): Promise<LoginResult> => {
    const { user, session } = await api.post('/auth/login', { email, password }).then((r) => r.data);
    return { user: toAuthUser(user, user._role), accessToken: session.access_token, refreshToken: session.refresh_token };
  },

  register: async (email: string, password: string, nickname: string, phone: string): Promise<RegisterResult> => {
    const { user, session } = await api.post('/auth/register', { email, password, nickname, phone }).then((r) => r.data);
    return { user: toAuthUser(user), accessToken: session?.access_token ?? null, refreshToken: session?.refresh_token ?? null };
  },

  checkNickname: async (nickname: string): Promise<boolean> => {
    const { exists } = await api.get(`/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`).then((r) => r.data);
    return exists;
  },

  updateProfile: (nickname: string, phone: string): Promise<{ ok: boolean }> =>
    api.patch('/auth/profile', { nickname, phone }).then((r) => r.data),

  logout: (): Promise<{ ok: boolean }> => api.post('/auth/logout').then((r) => r.data),
};
