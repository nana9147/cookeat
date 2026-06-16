import Image from 'next/image';

type RecipeCardProps = {
  title: string;
  image: string;
  author: string;
  rating: number;
  reviewCount: number;
};

export default function RecipeCard({ title, image, author, rating, reviewCount }: RecipeCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-border cursor-pointer hover:shadow-md transition-shadow">
      <div className="relative h-30 bg-card-bg">
        {image ? (
          <Image src={image} alt={title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
            </svg>
          </div>
        )}
        <button className="absolute top-2 right-2 text-white text-base leading-none">♡</button>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-dark-text truncate">{title}</h3>
        <p className="text-xs text-gray-text mt-0.5">{author}</p>
        <p className="text-xs text-gray-text mt-1">⭐ {rating} ({reviewCount})</p>
      </div>
    </div>
  );
}
