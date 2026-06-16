import { ShoppingProduct } from '@/types/ingredient';
import IngredientCard from '@/components/ingredient/IngredientCard';

interface ShoppingGridProps {
  products: ShoppingProduct[];
}

export default function ShoppingGrid({ products }: ShoppingGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center text-light-gray text-sm">
        조건에 맞는 상품이 없어요.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-3 tablet:gap-4">
      {products.map((product) => (
        <IngredientCard key={product.id} product={product} />
      ))}
    </div>
  );
}
