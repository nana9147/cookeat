import CartStepper from '@/components/(auth)/cart/CartStepper';
import Cart from '@/components/(auth)/cart/Cart';
import OrderList from '@/components/(auth)/cart/OrderList';

export default function Order() {
  return (
    <div className="max-w-300 mx-auto px-4 desktop:px-6 py-6 desktop:py-10">
      <h2 className="text-h3 desktop:text-h2 font-bold text-dark-text mb-2">장바구니</h2>
      <CartStepper />
      <div className="flex flex-col desktop:flex-row gap-6 mt-6 desktop:mt-8 items-start">
        <div className="flex-1 min-w-0 w-full">
          <Cart />
        </div>
        <div className="w-full desktop:w-77.5 shrink-0 desktop:sticky desktop:top-6">
          <OrderList />
        </div>
      </div>
    </div>
  );
}
