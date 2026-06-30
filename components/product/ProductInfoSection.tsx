interface Props {
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  qnaCount?: number;
  price: number;
  discountRate?: number;
  discountedPrice: number;
  shippingInfo: string;
  details: { label: string; value: string }[];
}

export function ProductInfoSection({
  name,
  category,
  rating,
  reviewCount,
  qnaCount,
  price,
  discountRate,
  discountedPrice,
  shippingInfo,
  details,
}: Props) {
  return (
    <>
      <div>
        <p className="text-xs text-primary font-medium mb-1">{category}</p>
        <h1 className="text-xl font-bold text-dark-text leading-snug">{name}</h1>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-text">
          <span className="flex items-center gap-1">
            <span className="text-yellow">★</span>
            <span>{rating.toFixed(1)}</span>
          </span>
          <span>리뷰 {reviewCount.toLocaleString()}건</span>
          {qnaCount !== undefined && <span>Q&A {qnaCount}건</span>}
        </div>
      </div>
      <div>
        {discountRate && (
          <p className="text-xs text-muted line-through">{price.toLocaleString()}원</p>
        )}
        <div className="flex items-baseline gap-2">
          {discountRate && <span className="text-lg font-bold text-red">{discountRate}%</span>}
          <span className="text-2xl font-bold text-dark-text">{discountedPrice.toLocaleString()}원</span>
        </div>
        <p className="text-xs text-light-gray mt-1">{shippingInfo}</p>
      </div>
      {details.length > 0 && (
        <table className="w-full text-xs border-t border-border">
          <tbody>
            {details.map(({ label, value }) => (
              <tr key={label} className="border-b border-border">
                <td className="py-2 pr-4 text-light-gray w-20 shrink-0">{label}</td>
                <td className="py-2 text-gray-text">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
