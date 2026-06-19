import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { MOCK_RECIPE_DETAILS } from '../data/mockRecipes';
import RecipeHero from './_components/RecipeHero';
import RecipeMetaRow from './_components/RecipeMetaRow';
import RecipeAuthor from './_components/RecipeAuthor';
import RecipeIngredients from './_components/RecipeIngredients';
import RecipeSteps from './_components/RecipeSteps';
import ReviewSection from '@/components/common/ReviewSection';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params;
  const recipe = MOCK_RECIPE_DETAILS[id];
  if (!recipe) notFound();

  return (
    <div className="max-w-360 mx-auto px-4 tablet:px-6 desktop:px-10 py-6">
      <nav className="flex items-center gap-1 text-xs text-light-gray mb-6">
        <Link href="/" className="hover:text-primary transition-colors">홈</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/recipes" className="hover:text-primary transition-colors">레시피</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-text">{recipe.title}</span>
      </nav>

      <RecipeHero title={recipe.title} description={recipe.description} imageUrl={recipe.imageUrl} />
      <RecipeMetaRow
        cookTime={recipe.cookTime}
        servings={recipe.servings}
        calories={recipe.calories}
        rating={recipe.rating}
      />
      <RecipeAuthor author={recipe.author} />
      <RecipeIngredients ingredients={recipe.ingredients} />
      <RecipeSteps steps={recipe.steps} />

      <div className="mt-2">
        <ReviewSection
          averageRating={recipe.rating}
          totalCount={recipe.reviewCount}
          ratingBreakdown={recipe.ratingBreakdown}
          reviews={recipe.reviews}
        />
      </div>
    </div>
  );
}
