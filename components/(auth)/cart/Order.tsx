'use client';

import { useRouter } from 'next/navigation';
import CartStepper from '@/components/(auth)/cart/CartStepper';
import Cart from '@/components/(auth)/cart/Cart';
import CartPaymentSummary from '@/components/(auth)/cart/CartPaymentSummary';
import { useCartItems } from '@/components/(auth)/cart/useCartItems';
import { useCartSelection } from '@/components/(auth)/cart/useCartSelection';
import { useCartStore } from '@/store/cartStore';
import { calcShipping } from '@/lib/shipping';

export default function Order() {
  const router = useRouter();
  const setCheckoutItems = useCartStore((s) => s.setCheckoutItems);
  const { items, storeItems, loading, error, updateQuantity, removeItem, removeItems } = useCartItems();
  const { validSelected, allSelected, toggleAll, toggleItem, setSelectedIds } = useCartSelection(items);

  const deleteSelected = () => { removeItems(validSelected); setSelectedIds([]); };

  const selectedAvailable = items.filter((i) => i.available && validSelected.includes(i.productId));
  const selectedTotal = selectedAvailable.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const selectedShipping = calcShipping(selectedTotal);
  const selectedFinal = selectedTotal + selectedShipping;
  const selectedItemCount = selectedAvailable.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = () => {
    setCheckoutItems(storeItems.filter((s) => selectedAvailable.some((i) => i.productId === s.productId)));
    router.push('/cart/checkout');
  };

  return (
    <div className="max-w-300 mx-auto px-4 desktop:px-6 py-6 desktop:py-10">
      <h2 className="text-h3 desktop:text-h2 font-bold text-dark-text mb-2">장바구니</h2>
      <CartStepper />
      <div className="flex flex-col desktop:flex-row gap-6 mt-6 desktop:mt-8 items-start">
        <div className="flex-1 min-w-0 w-full">
          <Cart
            items={items}
            loading={loading}
            error={error}
            selectedIds={validSelected}
            allSelected={allSelected}
            onToggleAll={toggleAll}
            onToggle={toggleItem}
            onQtyChange={updateQuantity}
            onDelete={removeItem}
            onDeleteSelected={deleteSelected}
          />
        </div>
        <div className="w-full desktop:w-77.5 shrink-0 desktop:sticky desktop:top-6">
          <CartPaymentSummary
            totalAmount={selectedTotal}
            shippingFee={selectedShipping}
            finalAmount={selectedFinal}
            itemCount={selectedItemCount}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}
