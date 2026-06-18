const checkmark = (
  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

type Props = { checked: boolean; onChange?: () => void; className?: string; disabled?: boolean };

export default function CircleCheckbox({ checked, onChange, className = '', disabled = false }: Props) {
  const base = `w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
    checked ? 'bg-primary border-primary' : 'bg-white border-muted'
  } ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`;

  if (onChange) {
    return (
      <button type="button" onClick={onChange} disabled={disabled} className={base}>
        {checked && checkmark}
      </button>
    );
  }

  return <div className={base}>{checked && checkmark}</div>;
}
