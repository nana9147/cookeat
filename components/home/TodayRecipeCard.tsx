export default function TodayRecipeCard() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200">
      <div className="flex justify-between">
        <h3 className="font-semibold">오늘의 추천 레시피</h3>

        <span className="text-xs text-gray-400">더보기</span>
      </div>

      <div className="h-[120px] bg-[#E7E1D3] rounded-xl mt-2 mb-3" />

      <h4 className="font-medium">나홀로 불 비빔밥</h4>

      <p className="text-xs text-gray-500">⭐ 4.8 (96)</p>
    </div>
  );
}
