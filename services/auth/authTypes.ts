export interface AuthUser {
  userId: string;
  nickname: string;
  profileImage: string | null;
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

export function toAuthUser(raw: { id: string; user_metadata?: { nickname?: string; avatar_url?: string } }): AuthUser {
  return {
    userId: raw.id,
    nickname: raw.user_metadata?.nickname ?? '',
    profileImage: raw.user_metadata?.avatar_url ?? null,
  };
}
