'use client';

interface Props {
  value: string;
  customLabel: string;
  onPreset: (label: string) => void;
  onCustomChange: (v: string) => void;
}

const PRESETS = ['집', '회사'];

const INPUT =
  'w-full px-3 py-2.5 border border-border rounded-lg text-sm ' +
  'text-dark-text placeholder:text-muted ' +
  'focus:outline-none focus:border-primary transition-colors';

export default function AddressLabelPicker({
  value,
  customLabel,
  onPreset,
  onCustomChange,
}: Props) {
  const isPreset = PRESETS.includes(value);

  function btnCls(active: boolean) {
    return [
      'px-3 py-1.5 rounded-lg border text-sm transition-colors',
      active
        ? 'border-primary bg-hover text-primary font-medium'
        : 'border-border text-gray-text hover:bg-beige',
    ].join(' ');
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-dark-text">배송지 이름 *</label>
      <div className="flex gap-2">
        {PRESETS.map((p) => (
          <button key={p} type="button" onClick={() => onPreset(p)} className={btnCls(value === p)}>
            {p}
          </button>
        ))}
        <button type="button" onClick={() => onPreset('')} className={btnCls(!isPreset)}>
          직접입력
        </button>
      </div>
      {!isPreset && (
        <input
          type="text"
          value={customLabel}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder="배송지 이름 입력"
          maxLength={50}
          className={INPUT}
        />
      )}
    </div>
  );
}
