import ProductForm from '@/app/seller/components/ProductForm';
import TempSaveButton from '@/app/seller/components/ProductForm/TempSaveButton';
import { ProductFormData } from '@/types/seller/product';

const MOCK_PRODUCT: ProductFormData = {
  basicInfo: {
    category: '채소',
    name: '유기농 토마토 500g',
    manufacturer: '멋사농장',
    origin: '국내산',
    status: '판매중',
  },
  pricingInfo: {
    price: '15900',
    stock: '100',
    discountType: 'amount',
    discountValue: '3000',
    minQuantity: '',
    maxQuantity: '',
  },
  images: {
    images: [
      {
        id: 'mock-img-1',
        preview: 'https://cdn-icons-png.flaticon.com/128/15115/15115165.png',
      },
    ],
  },
  description: { content: '이건 멋사농장 토마토~' },
  shippingInfo: {
    shippingFeeType: '유료',
    shippingFee: '3000',
    returnFee: '3000',
    freeThreshold: '',
    originAddress: '',
    returnAddress: '',
  },
  productInfo: {
    infoItemName: '토마토',
    infoFoodType: '채소',
    infoProducer: '멋사농장',
    infoOrigin: '국내산',
    infoExpirationDate: '수확일로부터 7일',
    infoStorageMethod: '냉장보관',
    infoWeight: '500g',
  },
  returnPolicy: {
    content: '신선식품 특성상 단순 변심 반품 불가',
  },
};

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1>상품 수정</h1>
        <TempSaveButton />
      </div>
      <ProductForm mode="edit" initialData={MOCK_PRODUCT} />
    </div>
  );
}
