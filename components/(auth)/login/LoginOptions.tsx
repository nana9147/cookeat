interface Props {
  keepLogin: boolean;
  onKeepLoginChange: (val: boolean) => void;
}

export default function LoginOptions({ keepLogin, onKeepLoginChange }: Props) {
  return (
    <div className="flex items-center justify-between text-sm">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={keepLogin}
          onChange={(e) => onKeepLoginChange(e.target.checked)}
          className="accent-primary"
        />
        로그인 유지
      </label>
      <button type="button" className="text-gray-text hover:text-primary transition-colors">
        비밀번호 찾기
      </button>
    </div>
  );
}
