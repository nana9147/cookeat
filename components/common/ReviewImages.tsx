import Image from 'next/image';

export function ReviewImages({ images }: { images: string[] }) {
  if (images.length === 0) return null;
  return (
    <div className="flex gap-2 mt-3 flex-wrap">
      {images.map((url, i) => (
        <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden bg-card-bg shrink-0">
          <Image src={url} alt={`리뷰 이미지 ${i + 1}`} fill className="object-cover" />
        </div>
      ))}
    </div>
  );
}
