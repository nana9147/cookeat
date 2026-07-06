import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { CustomerCardProps } from '@/types/seller/statistics';

export default function CustomerCard({ customer }: CustomerCardProps) {
  const total = customer.newCustomerCount + customer.returningCustomerCount;

  return (
    <Card className="border-border shadow-sm h-full">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-h5 font-semibold text-dark-text">신규·재구매 고객</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-h3 font-bold text-dark-text max-mobile:text-h4">
          재구매율 {customer.returningRate}%
        </p>
        <div className="flex flex-col gap-2 mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-gray-text">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              신규 고객
            </span>
            <span className="text-dark-text">{customer.newCustomerCount}명</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-gray-text">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              재구매 고객
            </span>
            <span className="text-dark-text">{customer.returningCustomerCount}명</span>
          </div>
          <p className="text-xs text-light-gray mt-1">이번 기간 구매 고객 총 {total}명</p>
        </div>
      </CardContent>
    </Card>
  );
}
