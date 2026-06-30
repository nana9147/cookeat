import { type ReactNode } from 'react';

export const inputCls = (error?: string) =>
  `h-11 w-full px-4 rounded-lg border text-sm outline-none focus:border-primary transition-colors disabled:bg-gray-50 disabled:text-gray-text ${
    error ? 'border-red-400 bg-red-50' : 'border-border'
  }`;

interface Props {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export default function FormField({ label, required, error, children }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-dark-text">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
