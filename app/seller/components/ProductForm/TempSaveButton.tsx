'use client';

export default function TempSaveButton() {
  const handleTempSave = () => {
    alert('임시저장 되었습니다.');
  };

  return (
    <button
      type="button"
      onClick={handleTempSave}
      className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
    >
      임시저장
    </button>
  );
}
