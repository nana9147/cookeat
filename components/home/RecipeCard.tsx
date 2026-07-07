import Image from 'next/image';
import Link from 'next/link';

type RecipeCardProps = {
  recipeId?: number;
  title: string;
  image: string;
  author: string;
  rating: number;
  reviewCount: number;
  priority?: boolean;
};

function CardContent({ title, image, author, rating, reviewCount, priority }: Omit<RecipeCardProps, 'recipeId'>) {
  return (
    <>
      <div className="relative h-30 bg-card-bg">
        {image ? (
          <Image src={image} alt={title} fill className="object-cover" priority={priority} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-dark-text truncate">{title}</h3>
        <p className="text-xs text-gray-text mt-0.5">{author}</p>
        <p className="text-xs text-gray-text mt-1">
          ⭐ {rating} ({reviewCount})
        </p>
      </div>
    </>
  );
}

export default function RecipeCard({ recipeId, title, image, author, rating, reviewCount, priority }: RecipeCardProps) {
  const contentProps = { title, image, author, rating, reviewCount, priority };

  if (recipeId) {
    return (
      <Link
        href={`/recipes/${recipeId}`}
        className="block bg-white rounded-xl overflow-hidden border border-border hover:shadow-md transition-shadow"
      >
        <CardContent {...contentProps} />
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-border">
      <CardContent {...contentProps} />
    </div>
  );
}
