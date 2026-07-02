import Image from 'next/image';

export function ReviewAvatar({
  nickname,
  profileImage,
}: {
  nickname: string;
  profileImage: string | null;
}) {
  return (
    <div className="w-8 h-8 rounded-full bg-card-bg flex items-center justify-center shrink-0 overflow-hidden">
      {profileImage ? (
        <Image src={profileImage} alt={nickname} width={32} height={32} className="object-cover w-full h-full" />
      ) : (
        <span className="text-xs font-medium text-gray-text">{nickname.charAt(0)}</span>
      )}
    </div>
  );
}
