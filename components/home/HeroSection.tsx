import Image from 'next/image';

export default function HeroSection() {
  return (
    <div className="bg-card-bg rounded-2xl p-6 desktop:p-8 flex flex-col desktop:flex-row items-start justify-between gap-6">
      <div className="flex flex-col justify-center">
        <h1 className="text-3xl desktop:text-5xl font-bold mb-3 text-dark-text">오늘 뭐 먹지?</h1>
        <p className="text-gray-text text-sm mb-6">다양한 레시피를 쿠짓에서 찾아보세요!</p>
        <button className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-full text-sm font-medium w-fit transition-colors">
          레시피 둘러보기 →
        </button>
        <div className="flex gap-2 mt-6">
          <div className="w-5 h-1.5 rounded-full bg-primary" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted" />
        </div>
      </div>

      <div className="relative w-full desktop:w-80 h-44 tablet:h-52 desktop:h-64 rounded-2xl overflow-hidden shrink-0">
        <Image
          src="/images/categories/recipes/bibimbap.png"
          alt="오늘의 추천 메뉴"
          fill
          priority
          className="object-cover"
        />
      </div>
    </div>
  );
}
