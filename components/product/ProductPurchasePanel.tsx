'use client';

import { useState } from 'react';
import { ProductOption, ProductPurchasePanelProps } from './types';
import { ProductInfoSection } from './ProductInfoSection';
import { PurchaseControls } from './PurchaseControls';
import { PurchaseActionButtons } from './PurchaseActionButtons';

export type { ProductOption };
export type { ProductPurchasePanelProps };

export default function ProductPurchasePanel({
  name,
  category,
  rating,
  reviewCount,
  qnaCount,
  price,
  discountRate,
  shippingInfo = '3만원 이상 무료배송 · 당일 출고',
  details = [],
  options = [],
  stock,
  onAddToCart,
}: ProductPurchasePanelProps) {
  const [liked, setLiked] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(
    options.length === 0 ? { label: name, price } : options.length === 1 ? options[0] : null
  );
  const [qty, setQty] = useState(1);

  const discountedPrice = discountRate ? Math.round(price * (1 - discountRate / 100)) : price;
  const unitPrice = selectedOption
    ? discountRate
      ? Math.round(selectedOption.price * (1 - discountRate / 100))
      : selectedOption.price
    : discountedPrice;
  const totalPrice = selectedOption ? unitPrice * qty : 0;

  return (
    <div className="flex flex-col gap-4 bg-card rounded-2xl p-4 h-full">
      <ProductInfoSection
        name={name} category={category} rating={rating} reviewCount={reviewCount}
        qnaCount={qnaCount} price={price} discountRate={discountRate}
        discountedPrice={discountedPrice} shippingInfo={shippingInfo} details={details}
      />
      <PurchaseControls
        options={options} selectedOption={selectedOption} qty={qty} stock={stock}
        unitPrice={unitPrice} totalPrice={totalPrice}
        onSelect={(opt) => { setSelectedOption(opt); setQty(1); }}
        onDecrement={() => {
          if (qty <= 1) { setSelectedOption(null); setQty(1); }
          else setQty((p) => p - 1);
        }}
        onIncrement={() => setQty((p) => Math.min(stock, p + 1))}
        onQtyChange={setQty}
      />
      <PurchaseActionButtons
        liked={liked}
        onToggleLike={() => setLiked((p) => !p)}
        disabled={!selectedOption}
        onAddToCart={() => selectedOption && onAddToCart?.(selectedOption.label, qty)}
      />
    </div>
  );
}
