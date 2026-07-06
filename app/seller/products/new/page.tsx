import ProductForm from '@/app/seller/components/ProductForm';

export default function ProductRegisterPage() {
  return (
    <div className="bg-background p-8 max-tablet:p-4">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-h2 font-bold text-dark-text max-mobile:text-h3">상품 등록</h1>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
