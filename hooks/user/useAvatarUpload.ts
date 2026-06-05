'use client';

import { useRef, useState } from 'react';

export function useAvatarUpload(accessToken: string | null, onUploaded: (url: string) => void) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    const form = new FormData();
    form.append('avatar', file);
    const res = await fetch('/api/user/avatar', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    });
    const data = await res.json();
    setUploading(false);
    if (data.url) onUploaded(data.url);
  };

  return { preview, uploading, inputRef, handleChange };
}
