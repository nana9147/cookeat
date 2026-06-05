import Link from 'next/link'

export default function RegisterCompletePage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-dark-text">이메일을 확인해주세요</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            가입하신 이메일로 인증 메일을 발송했습니다.<br />
            메일의 링크를 클릭하면 가입이 완료됩니다.
          </p>
        </div>
        <Link
          href="/login"
          className="text-sm text-primary hover:underline"
        >
          로그인 페이지로 이동
        </Link>
      </div>
    </div>
  )
}
