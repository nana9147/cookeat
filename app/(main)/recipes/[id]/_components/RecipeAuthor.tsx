import Image from 'next/image';

interface RecipeAuthorProps {
  author: { userId: number; nickname: string; profileImage: string | null };
}

export default function RecipeAuthor({ author }: RecipeAuthorProps) {
  return (
    <div className="flex items-center justify-between py-4 border-t border-b border-border mb-8">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-card-bg flex items-center justify-center shrink-0 overflow-hidden">
          {author.profileImage ? (
            <Image
              src={author.profileImage}
              alt={author.nickname}
              width={36}
              height={36}
              className="object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-gray-text">{author.nickname.charAt(0)}</span>
          )}
        </div>
        <div>
          <p className="text-xs text-light-gray">레시피 작성자</p>
          <p className="text-sm font-semibold text-dark-text">{author.nickname}</p>
        </div>
      </div>
      <button className="h-8 px-4 rounded-lg border border-primary text-primary text-xs font-medium hover:bg-primary hover:text-white transition-colors">
        + 팔로우
      </button>
    </div>
  );
}
