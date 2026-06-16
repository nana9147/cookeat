import Image from 'next/image';

interface Feature {
  title: string;
  desc: string;
}

interface ProductDescriptionProps {
  title: string;
  description: string;
  imageUrl?: string;
  features: Feature[];
}

export default function ProductDescription({
  title,
  description,
  imageUrl,
  features,
}: ProductDescriptionProps) {
  return (
    <div className="space-y-8 bg-card p-5 rounded-2xl">
      {/* 대표 이미지 */}
      {imageUrl ? (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-card-bg">
          <Image src={imageUrl} alt="상품 설명 이미지" fill className="object-cover" />
        </div>
      ) : (
        <div className="aspect-video rounded-xl bg-card-bg flex items-center justify-center">
          <svg
            className="w-16 h-16 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01"
            />
          </svg>
        </div>
      )}

      {/* 설명 텍스트 */}
      <div>
        <h2 className="text-base font-bold text-dark-text mb-2">{title}</h2>
        <p className="text-sm text-gray-text leading-relaxed whitespace-pre-line">{description}</p>
      </div>

      {/* 특징 카드 — 번호 원형 아이콘 */}
      {features.length > 0 && (
        <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
          {features.map(({ title: featureTitle, desc }, idx) => (
            <div key={featureTitle} className="rounded-xl p-4 bg-hover flex flex-col gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <p className="text-sm font-semibold text-dark-text">{featureTitle}</p>
              <p className="text-xs text-gray-text leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
