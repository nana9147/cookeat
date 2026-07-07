import { TableRow, TableCell } from '@/components/ui/table';
interface EmptyRowsProps {
  count: number;
  colSpan: number;
}

export default function EmptyRows({ count, colSpan }: EmptyRowsProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TableRow key={`empty-${i}`}>
          <TableCell colSpan={colSpan} className="py-[30.5px]" />
        </TableRow>
      ))}
    </>
  );
}
