import Image from 'next/image';

type RecipeCardProps = {
  title: string;
  image: string;
};
export default function RecipeCard({ title, image }: RecipeCardProps) {
  return (
    <div
      className="
    bg-white
    rounded-xl
    overflow-hidden
    border
    border-gray-200
    cursor-pointer
    transition-all
    duration-300
    hover:scale-[1.03]
    hover:-translate-y-1
    hover:shadow-lg
  "
    >
      <Image
        src={image}
        alt={title}
        width={300}
        height={160}
        className="w-full h-[120px] object-cover"
      />

      <div className="p-3">
        <h3 className="text-sm font-medium">{title}</h3>

        <div className="flex justify-between mt-2">
          <span className="text-xs">⭐ 4.8</span>

          <button>♡</button>
        </div>
      </div>
    </div>
  );
}
