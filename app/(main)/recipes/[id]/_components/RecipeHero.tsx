import Image from 'next/image';
import { UtensilsCrossed } from 'lucide-react';

interface RecipeHeroProps {
  title: string;
  description: string;
  imageUrl?: string;
}

export default function RecipeHero({ title, description, imageUrl }: RecipeHeroProps) {
  return (
    <div className="mb-6">
      <div className="relative w-full aspect-video tablet:aspect-2/1 desktop:aspect-3/1 rounded-2xl overflow-hidden bg-card-bg mb-5">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed className="w-16 h-16 text-muted" />
          </div>
        )}
      </div>
      <h1 className="text-xl tablet:text-2xl font-bold text-dark-text mb-2">{title}</h1>
      <p className="text-sm text-gray-text leading-relaxed">{description}</p>
    </div>
  );
}
