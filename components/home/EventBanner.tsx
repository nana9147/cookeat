export default function EventBanner() {
  return (
    <div className="bg-card-bg rounded-2xl p-4 border border-border">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-dark-text mb-1">쿠킷 이벤트</h3>
          <p className="text-xs text-gray-text mb-3 leading-relaxed">
            지금 가입하고 쿠폰 받기<br />5,000원을 받아보세요!
          </p>
          <button className="bg-primary hover:bg-primary-hover text-white text-xs px-4 py-2 rounded-lg transition-colors">
            쿠폰 받기
          </button>
        </div>
        <div className="text-4xl ml-3 shrink-0">🎁</div>
      </div>
    </div>
  );
}
