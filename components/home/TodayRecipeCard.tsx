import Image from 'next/image';

export default function TodayRecipeCard() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-border cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-dark-text">오늘의 추천 레시피</h3>
        <span className="text-xs text-gray-text hover:text-dark-text transition-colors cursor-pointer">더보기</span>
      </div>

      <div className="relative h-36 rounded-xl overflow-hidden mb-3">
        <Image
          src="/images/categories/recipes/bibimbap.png"
          alt="나홀로 열무 비빔국수"
          fill
          className="object-cover"
        />
        <button className="absolute top-2 right-2 text-white text-base leading-none">♡</button>
      </div>

      <h4 className="text-sm font-medium text-dark-text">나홀로 열무 비빔국수</h4>
      <p className="text-xs text-gray-text mt-0.5">김밥팔고</p>
      <p className="text-xs text-gray-text mt-1">⭐ 4.8 (96)</p>
    </div>
  );
}
