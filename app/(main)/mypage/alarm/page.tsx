export default function AlarmPage() {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-bold text-dark-text">알림 설정</h3>
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <svg className="w-12 h-12 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p className="text-sm text-gray-text">알림 설정 기능은 준비 중입니다.</p>
      </div>
    </div>
  );
}
