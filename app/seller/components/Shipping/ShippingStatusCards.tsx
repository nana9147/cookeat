import { Card, CardContent } from '@/components/ui/card';
import { ShippingStatus, ShippingStatusCardsProps } from '@/types/seller/shipping';

export default function ShippingSatatusCard({
  cards,
  status,
  onStatusChange,
}: ShippingStatusCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-5">
      {cards.map((item) => (
        <Card
          key={item.label}
          className={`cursor-pointer ${status === item.filterValue ? 'ring-2 ring-primary' : ''}`}
          onClick={() => {
            const newFilter = item.filterValue as ShippingStatus | '전체';
            onStatusChange(status === newFilter ? '전체' : newFilter);
          }}
        >
          <CardContent>
            <p>{item.label}</p>
            <p>{item.count}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
