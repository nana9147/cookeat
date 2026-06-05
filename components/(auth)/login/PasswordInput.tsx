'use client';

import { Eye, EyeOff } from 'lucide-react';

// 공통 인풋 스타일
const inputCls =
  'flex-1 h-11 px-4 rounded-lg border border-border text-sm outline-none focus:border-primary transition-colors';

interface Props {
  name?: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
}

// 비밀번호 표시/숨기기 토글이 있는 인풋 컴포넌트
export default function PasswordInput({ name, value, onChange, show, onToggle, placeholder }: Props) {
  return (
    <div className="flex items-center gap-0 relative">
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} pr-11`}
      />
      {/* 눈 아이콘 버튼: 탭 포커스 제외 */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 text-gray-400 hover:text-gray-600"
        tabIndex={-1}
        aria-label={show ? '비밀번호 숨기기' : '비밀번호 보기'}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
