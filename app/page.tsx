export default function Home() {
  return (
    <main className="w-full max-w-[1200px] mx-auto px-4 py-6">
      {/* 상단 영역 */}
      <section className="grid grid-cols-4 gap-6">
        {/* 메인 배너 */}
        <div className="lg:col-span-3 bg-[#F4F0E8] rounded-2xl p-8 min-h-[320px] flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">오늘 뭐 먹지?</h1>

            <p className="text-gray-600 mb-6">다양한 레시피를 구경해 보세요!</p>

            <button className="bg-green-700 text-white px-5 py-3 rounded-full">
              레시피 둘러보기
            </button>
          </div>

          <div className="w-[240px] h-[240px] bg-[#E7E1D3] rounded-xl flex items-center justify-center">
            🍜
          </div>
        </div>

        {/* 포인트 카드 */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold">안녕하세요, 쿠팡님</h3>

            <div className="bg-green-700 text-white rounded-xl mt-4 p-4">
              <p>보유 포인트</p>

              <p className="text-2xl font-bold">12,500P</p>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-4">
            <h3 className="font-semibold mb-3">오늘의 추천 레시피</h3>

            <div className="h-40 bg-[#F4F0E8] rounded-xl" />
          </div>
        </div>
      </section>

      {/* 인기 레시피 */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">인기 레시피</h2>

        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="h-36 bg-[#F4F0E8] rounded-t-xl" />

              <div className="p-3">
                <h3>레시피 {item}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 카테고리 */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">카테고리</h2>

        <div className="flex gap-4 flex-wrap">
          {['한식', '양식', '중식', '일식', '디저트', '샐러드', '간식', '음료'].map((category) => (
            <div key={category} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-[#F4F0E8]" />

              <span className="text-sm">{category}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="bg-[#F4F0E8] rounded-2xl p-4">
        <h3 className="font-semibold mb-2">쿠킷 이벤트</h3>

        <p className="text-sm text-gray-600 mb-3">신규 가입 시 포인트 지급</p>

        <button className="bg-green-700 text-white px-3 py-2 rounded-lg">쿠폰 받기</button>
      </div>
    </main>
  );
}
