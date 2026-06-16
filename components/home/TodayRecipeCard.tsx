import Image from 'next/image';
export default function TodayRecipeCard() {
  return (
    <div
      className="
    bg-white
    rounded-2xl
    p-4
    border
    border-gray-200
    transition-all
    duration-300
    hover:-translate-y-1
    hover:shadow-lg
    cursor-pointer
  "
    >
      <div className="flex justify-between">
        <h3 className="font-semibold">오늘의 추천 레시피</h3>

        <span className="text-xs text-gray-400">더보기</span>
      </div>

      <div className="relative h-[120px] rounded-xl overflow-hidden mt-2 mb-3">
        <Image
          src="/images/categories/recipes/bibimbap.png"
          alt="나홀로 열무 비빔국수"
          fill
          className="object-cover"
        />
      </div>

      <h4 className="font-medium">나홀로 열무 비빔국수</h4>

      <p className="text-xs text-gray-500">⭐ 4.8 (96)</p>
    </div>
  );
}
