export default function EventBanner() {
  return (
    <div className="bg-card-bg rounded-2xl p-4 border border-border">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-dark-text mb-1">쿠킷 이벤트</h3>
          <p className="text-xs text-gray-text mb-3 leading-relaxed">
            지금 가입하고
            <br />
            포인트 2,000을 받아보세요!
          </p>
        </div>
        <div className="text-4xl ml-3 shrink-0">🎁</div>
      </div>
    </div>
  );
}
