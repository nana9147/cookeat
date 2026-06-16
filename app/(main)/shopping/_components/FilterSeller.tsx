interface FilterSellerProps {
  sellers: string[];
  selectedSellers: string[];
  onSellerToggle: (seller: string) => void;
}

export default function FilterSeller({ sellers, selectedSellers, onSellerToggle }: FilterSellerProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-dark-text mb-2">판매자</h3>
      <ul className="space-y-1 max-h-40 overflow-y-auto pr-1">
        {sellers.map((seller) => (
          <li key={seller}>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedSellers.includes(seller)}
                onChange={() => onSellerToggle(seller)}
                className="accent-primary"
              />
              <span className="text-xs text-gray-text group-hover:text-dark-text transition-colors">
                {seller}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
