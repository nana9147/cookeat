export default function ProfileAvatar() {
  return (
    <div className="mb-6 flex flex-col items-center gap-3">
      <div className="size-20 rounded-full bg-primary" />
      <button
        type="button"
        className="text-xs text-gray-text underline underline-offset-2 hover:text-primary transition-colors"
      >
        프로필 사진 변경
      </button>
    </div>
  );
}
