export interface AuthUser {
  userId: string;
  email: string;
  nickname: string;
  profileImage: string | null;
  isSocial: boolean;
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

export function toAuthUser(raw: {
  id: string;
  email?: string;
  user_metadata?: { nickname?: string; avatar_url?: string };
  app_metadata?: { provider?: string };
}): AuthUser {
  return {
    userId: raw.id,
    email: raw.email ?? '',
    nickname: raw.user_metadata?.nickname ?? '',
    profileImage: raw.user_metadata?.avatar_url ?? null,
    isSocial: raw.app_metadata?.provider !== 'email',
  };
}
