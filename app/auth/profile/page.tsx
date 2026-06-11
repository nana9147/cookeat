'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/auth/authService'
import PhoneInput from '@/components/ui/PhoneInput'

const inputCls = 'h-11 px-4 rounded-lg border border-border text-sm outline-none focus:border-primary transition-colors'
const btnCls = 'h-11 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
const checkBtnCls = 'shrink-0 px-4 h-11 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed'

type CheckResult = { text: string; ok: boolean }

export default function ProfilePage() {
  const router = useRouter()
  const initial = useAuthStore((s) => s.user?.nickname ?? '')
  const [nickname, setNicknameRaw] = useState(initial)
  const [check, setCheck] = useState<CheckResult | null>(initial ? { text: '소셜 닉네임입니다.', ok: true } : null)
  const [isChecking, setIsChecking] = useState(false)
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const setNickname = (v: string) => {
    setNicknameRaw(v)
    setCheck(v === initial && initial ? { text: '소셜 닉네임입니다.', ok: true } : null)
  }

  const handleNicknameCheck = async () => {
    if (!nickname.trim()) return
    setIsChecking(true)
    try {
      const exists = await authService.checkNickname(nickname.trim())
      setCheck(exists ? { text: '이미 사용 중인 닉네임입니다.', ok: false } : { text: '사용 가능한 닉네임입니다.', ok: true })
    } catch {
      setCheck({ text: '확인 중 오류가 발생했습니다.', ok: false })
    } finally {
      setIsChecking(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!check?.ok || !phone.trim()) return
    setIsLoading(true)
    setError(null)
    try {
      await authService.updateProfile(nickname.trim(), phone.trim())
      alert('로그인되었습니다.')
      router.replace('/')
    } catch {
      setError('저장 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-dark-text">프로필 설정</h1>
          <p className="text-sm text-gray-text mt-1">서비스 이용을 위해 정보를 입력해주세요.</p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-dark-text">닉네임</label>
            <div className="flex gap-2">
              <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="닉네임을 입력해주세요" className={`flex-1 ${inputCls}`} />
              <button type="button" onClick={handleNicknameCheck} disabled={isChecking || !nickname.trim() || nickname === initial} className={checkBtnCls}>
                {isChecking ? '확인 중...' : '중복 확인'}
              </button>
            </div>
            {check && <p className={`text-xs ${check.ok ? 'text-primary' : 'text-red'}`}>{check.text}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-dark-text">전화번호</label>
            <PhoneInput value={phone} onChange={setPhone} className={inputCls} />
          </div>
          {error && <p className="text-xs text-red">{error}</p>}
          <button type="submit" disabled={!check?.ok || !phone.trim() || isLoading} className={btnCls}>
            {isLoading ? '저장 중...' : '완료'}
          </button>
        </form>
      </div>
    </main>
  )
}
