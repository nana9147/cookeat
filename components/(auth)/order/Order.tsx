import CartStepper from '@/components/(auth)/order/CartStepper';
import Cart from '@/components/(auth)/order/Cart';
import OrderList from '@/components/(auth)/order/OrderList';

export default function Order() {
  return (
    <div className="max-w-300 mx-auto px-6 py-10">
      <h2 className="text-h2 font-bold text-dark-text mb-2">장바구니</h2>
      <CartStepper />
      <div className="flex gap-6 mt-8 items-start">
        <div className="flex-1 min-w-0">
          <Cart />
        </div>
        <div className="w-77.5 shrink-0 sticky top-6">
          <OrderList />
        </div>
      </div>
    </div>
  );
}
