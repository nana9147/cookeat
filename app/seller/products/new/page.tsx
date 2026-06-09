import ProductForm from '@/app/seller/components/ProductForm';
import TempSaveButton from '@/app/seller/components/ProductForm/TempSaveButton';

export default function ProductRegisterPage() {
  return (
    <div className="p-6 max-w-3xl ">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h2 font-semibold text-gray-800">상품 등록</h1>
        <TempSaveButton />
      </div>

      {/* 상품 등록 폼 */}
      <ProductForm mode="create" />
    </div>
  );
}
