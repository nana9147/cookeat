import { Card, CardContent } from '@/components/ui/card';

interface StatusCardItem {
  label: string;
  count: number;
  filterValue: string;
}

interface StatusCardsProps<T extends string> {
  cards: StatusCardItem[];
  status: T;
  onStatusChange: (value: T) => void;
  colorMap: Record<string, string>;
  cols?: number;
}

export default function StatusCards<T extends string>({
  cards,
  status,
  onStatusChange,
  colorMap,
  cols = 5,
}: StatusCardsProps<T>) {
  return (
    <div className={`grid grid-cols-${cols} gap-4 mb-5`}>
      {cards.map((item) => (
        <Card
          key={item.label}
          className={`cursor-pointer ${status === item.filterValue ? 'ring-2 ring-primary' : ''}`}
          onClick={() => {
            const newFilter = item.filterValue as T;
            onStatusChange(status === newFilter ? ('전체' as T) : newFilter);
          }}
        >
          <CardContent className="py-2">
            <p className="text-sm text-gray-500 mb-2">{item.label}</p>
            <p className={`text-2xl font-bold ${colorMap[item.label] ?? 'text-gray-800'}`}>
              {item.count}건
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
