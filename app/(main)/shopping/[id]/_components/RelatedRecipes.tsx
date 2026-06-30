import Link from 'next/link';
import RecipeCard from '@/components/home/RecipeCard';

const MOCK_RELATED_RECIPES = [
  { id: '1', title: '파김치', image: '', author: '요리왕', rating: 4.8, reviewCount: 234 },
  { id: '2', title: '된장찌개 파스타', image: '', author: '집밥선생', rating: 4.6, reviewCount: 89 },
  { id: '3', title: '감자탕', image: '', author: '요리고수', rating: 4.7, reviewCount: 145 },
  { id: '4', title: '양파볶음밥', image: '', author: '쿠킷', rating: 4.5, reviewCount: 67 },
];

export default function RelatedRecipes() {
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-dark-text">이 재료가 들어가는 레시피</h2>
        <Link href="/recipes" className="text-xs text-gray-text hover:text-primary transition-colors flex items-center gap-0.5">
          더보기 &rsaquo;
        </Link>
      </div>
      <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3">
        {MOCK_RELATED_RECIPES.map((recipe) => (
          <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
            <RecipeCard
              title={recipe.title}
              image={recipe.image}
              author={recipe.author}
              rating={recipe.rating}
              reviewCount={recipe.reviewCount}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
