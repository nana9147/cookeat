export default function UserPointCard() {
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
    hover:shadow-lg
  "
    >
      <h3 className="font-semibold">안녕하세요, 쿠팡님</h3>

      <div className="bg-green-700 text-white rounded-xl mt-3 p-4">
        <p>보유 포인트</p>

        <p className="text-3xl font-bold">12,500P</p>
      </div>
    </div>
  );
}
