interface EmptyRowsProps {
  count: number;
  colSpan: number;
}

export default function EmptyRows({ count, colSpan }: EmptyRowsProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={`empty-${i}`}>
          <td colSpan={colSpan} className="py-[30.5px]" />
        </tr>
      ))}
    </>
  );
}
