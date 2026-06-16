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
      <div className="relative h-30">
        <Image src={image} alt={title} fill className="object-cover" />
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
