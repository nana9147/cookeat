import Image from 'next/image';

type CategoryItemProps = {
  name: string;
  image: string;
};

export default function CategoryItem({ name, image }: CategoryItemProps) {
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer group">
      <div className="w-12 h-12 rounded-full bg-card-bg overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
        <Image src={image} alt={name} width={48} height={48} className="object-cover" />
      </div>
      <span className="text-xs text-dark-text">{name}</span>
    </div>
  );
}
