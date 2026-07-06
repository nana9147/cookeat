'use client';

import { useRef, useEffect, useMemo, ChangeEvent } from 'react';
import { ImagePlus, X } from 'lucide-react';

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
  max?: number;
}

const MAX_SIZE_MB = 5;

export function InquiryImagePicker({ files, onChange, max = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const addFiles = (list: File[]) => {
    const valid = list.filter((f) => {
      if (!f.type.startsWith('image/')) return false;
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`${f.name} 파일이 ${MAX_SIZE_MB}MB를 초과해요.`);
        return false;
      }
      return true;
    });
    const remaining = max - files.length;
    if (remaining <= 0) {
      alert(`이미지는 최대 ${max}장까지 첨부할 수 있어요.`);
      return;
    }
    onChange([...files, ...valid.slice(0, remaining)]);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleRemove = (idx: number) => onChange(files.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-gray-text">사진 첨부 (선택, 최대 {max}장)</label>
      <div className="flex flex-wrap gap-2">
        {files.map((file, idx) => (
          <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previews[idx]} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {files.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted hover:border-primary transition-colors shrink-0"
          >
            <ImagePlus className="w-5 h-5" />
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleChange} />
    </div>
  );
}
