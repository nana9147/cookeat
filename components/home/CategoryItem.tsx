import Image from 'next/image';

type CategoryItemProps = {
  name: string;
  image: string;
};

export default function CategoryItem({ name, image }: CategoryItemProps) {
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer">
      <Image
        src={image}
        alt={name}
        width={100}
        height={100}
        className="
    rounded-full
    object-cover
    transition-all
    duration-300
    hover:scale-110
    hover:-translate-y-1
    hover:drop-shadow-lg
  "
      />

      <span className="text-xs">{name}</span>
    </div>
  );
}
