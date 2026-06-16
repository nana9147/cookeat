import RecipeCard from './RecipeCard';

const recipes = [
  {
    title: '크림 버섯 파스타',
    image: '/images/categories/recipes/pasta.png',
  },
  {
    title: '된장찌개',
    image: '/images/categories/recipes/doenjang.png',
  },
  {
    title: '김치찌개',
    image: '/images/categories/recipes/kimchi.png',
  },
  {
    title: '짜장면',
    image: '/images/categories/recipes/jajang.png',
  },
  {
    title: '토스트',
    image: '/images/categories/recipes/toast.png',
  },
];
export default function PopularRecipeSection() {
  return (
    <section className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">인기 레시피</h2>

        <button className="text-sm text-gray-500">더보기</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.title} title={recipe.title} image={recipe.image} />
        ))}
      </div>
    </section>
  );
}
