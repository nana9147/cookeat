import CategoryItem from './CategoryItem';

const categories = [
  { name: '한식', image: '/images/categories/korean.png' },
  { name: '양식', image: '/images/categories/western.png' },
  { name: '중식', image: '/images/categories/chinese.png' },
  { name: '일식', image: '/images/categories/japanese.png' },
  { name: '디저트', image: '/images/categories/dessert.png' },
  { name: '샐러드', image: '/images/categories/salad.png' },
  { name: '간식', image: '/images/categories/snack.png' },
  { name: '음료', image: '/images/categories/drink.png' },
  { name: '베이킹', image: '/images/categories/baking.png' },
  { name: '기타', image: '/images/categories/etc.png' },
];

export default function CategorySection() {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-4">카테고리</h2>

      <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-4">
        {categories.map((category) => (
          <CategoryItem key={category.name} name={category.name} image={category.image} />
        ))}
      </div>
    </section>
  );
}
