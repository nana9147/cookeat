'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { PricingFieldProps, DiscountType } from '@/types/seller/product';

export default function PricingField({
  price,
  stock,
  discountType,
  discountValue,
  minQuantity,
  maxQuantity,
  onPriceChange,
  onStockChange,
  onDiscountTypeChange,
  onDiscountValueChange,
  onMinQuantityChange,
  onMaxQuantityChange,
}: PricingFieldProps) {
  const [showDiscount, setShowDiscount] = useState(false);

  const calcDiscountedPrice = () => {
    const p = Number(price?.replace(/,/g, '') || 0);
    const v = Number(discountValue?.replace(/,/g, '') || 0);
    if (!p || !v || discountType === 'none') return null;
    if (discountType === 'amount') return Math.max(0, p - v).toLocaleString();
    if (discountType === 'rate') return Math.max(0, Math.round(p * (1 - v / 100))).toLocaleString();
  };

  const discountedPrice = calcDiscountedPrice();

  const inputClass =
    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5">
      <h2 className="text-sm font-semibold text-gray-700">판매 정보</h2>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            판매가 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              placeholder="0"
              min={0}
              step={100}
              className={inputClass}
            />
            <span className="absolute right-3 top-2 text-sm text-gray-400">원</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            재고 수량 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={stock}
            onChange={(e) => onStockChange(e.target.value)}
            placeholder="0"
            min={0}
            className={inputClass}
          />
        </div>
      </div>

      {/* 할인 설정 토글 */}
      <div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => {
              setShowDiscount(true);
              if (discountType === 'none') onDiscountTypeChange('amount');
            }}
            className={`${
              showDiscount
                ? 'bg-green-700 text-white border-green-700'
                : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
            }`}
          >
            할인 설정
          </Button>
          <Button
            type="button"
            onClick={() => {
              setShowDiscount(false);
              onDiscountTypeChange('none');
              onDiscountValueChange('');
            }}
            className={`${
              !showDiscount
                ? 'bg-green-700 text-white border-green-700'
                : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
            }`}
          >
            할인 미설정
          </Button>
        </div>

        {showDiscount && (
          <div className="mt-4 flex flex-col gap-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            {/* 할인 유형 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">할인 유형</label>
              <div className="flex gap-4">
                {(['amount', 'rate'] as const).map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="discountType"
                      value={type}
                      checked={discountType === type}
                      onChange={() => {
                        onDiscountTypeChange(type); // ✅ type을 discountType으로 변경
                        onDiscountValueChange(''); // ✅ 유형 바꾸면 값 초기화
                      }}
                      className="accent-green-600"
                    />
                    {type === 'amount' ? '정액 할인 (원)' : '정률 할인 (%)'}
                  </label>
                ))}
              </div>
            </div>

            {/* 할인 금액 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">할인 금액</label>
              <div className="relative">
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    const p = Number(price);
                    if (discountType === 'amount' && p && v > p) {
                      alert('할인 금액이 판매가보다 클 수 없어요.');
                      onDiscountValueChange(''); // ✅ 초기화
                      return;
                    }
                    if (discountType === 'rate' && v > 100) {
                      alert('할인율은 100%를 초과할 수 없어요.');
                      onDiscountValueChange(''); // ✅ 초기화
                      return;
                    }
                    onDiscountValueChange(e.target.value); // ✅ e.target.value로 수정
                  }}
                  placeholder={!price ? '판매가를 먼저 입력해주세요' : '0'}
                  disabled={!price}
                  min={0}
                  max={discountType === 'rate' ? 100 : Number(price) || undefined}
                  className={`${inputClass} ${!price ? 'bg-gray-100 cursor-not-allowed text-gray-400' : ''}`}
                />
                <span className="absolute right-3 top-2 text-sm text-gray-400">
                  {discountType === 'rate' ? '%' : '원'}
                </span>
              </div>
              {discountedPrice && (
                <p className="text-xl text-green-700 mt-3 font-medium text-right">
                  할인 적용가: {discountedPrice}원
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 최소/최대 구매 수량 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">최소 구매 수량</label>
          <input
            type="number"
            value={minQuantity}
            onChange={(e) => onMinQuantityChange(e.target.value)}
            placeholder="1"
            min={1}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">최대 구매 수량</label>
          <input
            type="number"
            value={maxQuantity}
            onChange={(e) => onMaxQuantityChange(e.target.value)}
            placeholder="제한 없음"
            min={1}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
