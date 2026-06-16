import Image from 'next/image';
export default function HeroSection() {
  return (
    <div
      className="
      bg-[#F4F0E8]
      rounded-2xl
      p-6
      lg:p-8
      flex
      flex-col
      lg:flex-row
      items-start
      gap-110
      "
    >
      <div className="lg:ml-40">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">오늘 뭐 먹지?</h1>

        <p className="text-gray-600 mb-8">다양한 레시피를 구경해 보세요!</p>

        <button
          className="
    bg-green-700
    text-white
    px-8
    py-3
    rounded-full
    font-medium
    transition-all
    duration-300
    hover:bg-green-800
    hover:scale-105
  "
        >
          레시피 둘러보기
        </button>

        <div className="flex gap-2 mt-8">
          <div className="w-5 h-1 rounded-full bg-green-700" />
          <div className="w-1 h-1 rounded-full bg-gray-400" />
          <div className="w-1 h-1 rounded-full bg-gray-400" />
        </div>
      </div>

      <div
        className="
  relative
  w-full
  lg:w-[500px]
  h-[180px]
  md:h-[250px]
  lg:h-[320px]
  rounded-2xl
  overflow-hidden
  "
      >
        <Image
          src="/images/categories/recipes/bibimbap.png"
          alt="오늘의 추천 메뉴"
          fill
          priority
          className="
      object-cover
      transition-transform
      duration-500
      hover:scale-105
    "
        />
      </div>
    </div>
  );
}
