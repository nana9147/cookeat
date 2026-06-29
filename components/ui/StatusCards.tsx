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

const GRID_COLS_MAP: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
};

export default function StatusCards<T extends string>({
  cards,
  status,
  onStatusChange,
  colorMap,
  cols = 5,
}: StatusCardsProps<T>) {
  const gridColsClass = GRID_COLS_MAP[cols] ?? 'grid-cols-5';

  return (
    <div className={`grid ${gridColsClass} gap-4 mb-5`}>
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
              {item.count.toLocaleString()}건
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
