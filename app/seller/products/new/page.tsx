import ProductForm from '@/app/seller/components/ProductForm';

export default function ProductRegisterPage() {
  return (
    <div className="bg-background p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-h2 font-bold text-dark-text">상품 등록</h1>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
