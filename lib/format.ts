export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${date} ${time}`;
};

export const formatWon = (n?: number | null) => (n == null ? '-' : `${n.toLocaleString()}원`);

// 공개 게시판(상품문의)에서 작성자 본인이 아닌 경우 닉네임 중간을 마스킹
export const maskNickname = (nickname: string): string => {
  if (nickname.length <= 2) return `${nickname[0]}*`;
  return `${nickname[0]}${'*'.repeat(nickname.length - 2)}${nickname[nickname.length - 1]}`;
};
