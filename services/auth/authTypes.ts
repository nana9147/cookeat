export type UserRole = 'user' | 'seller' | 'admin';

export interface AuthUser {
  userId: string;
  dbUserId: number;
  email: string;
  nickname: string;
  profileImage: string | null;
  isSocial: boolean;
  role: UserRole;
}

export interface LoginResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResult {
  user: AuthUser;
  accessToken: string | null;
  refreshToken: string | null;
}

export function toAuthUser(
  raw: {
    id: string;
    email?: string;
    user_metadata?: { nickname?: string; avatar_url?: string; custom_avatar_url?: string };
    app_metadata?: { provider?: string };
    _dbUserId?: number;
  },
  role: UserRole = 'user',
): AuthUser {
  return {
    userId: raw.id,
    dbUserId: raw._dbUserId ?? 0,
    email: raw.email ?? '',
    nickname: raw.user_metadata?.nickname ?? '',
    profileImage: raw.user_metadata?.custom_avatar_url ?? raw.user_metadata?.avatar_url ?? null,
    isSocial: raw.app_metadata?.provider !== 'email',
    role,
  };
}
