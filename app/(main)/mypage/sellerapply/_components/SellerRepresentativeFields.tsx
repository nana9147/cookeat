import FormField, { inputCls } from './FormField';

interface Props {
  isCoRepresentative: boolean;
  onIsCoRepresentativeChange: (v: boolean) => void;
  representativeName: string;
  onRepresentativeNameChange: (v: string) => void;
  representativeNameError?: string;
}

export default function SellerRepresentativeFields({
  isCoRepresentative,
  onIsCoRepresentativeChange,
  representativeName,
  onRepresentativeNameChange,
  representativeNameError,
}: Props) {
  return (
    <>
      <FormField label="공동 대표 여부" required>
        <div className="flex gap-2">
          {(
            [
              { label: '단독 대표', value: false },
              { label: '공동 대표', value: true },
            ] as const
          ).map(({ label, value }) => (
            <button
              key={label}
              type="button"
              onClick={() => onIsCoRepresentativeChange(value)}
              className={`flex-1 h-11 rounded-lg border text-sm font-medium transition-colors ${
                isCoRepresentative === value
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-white text-dark-text hover:border-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="대표자명" required error={representativeNameError}>
        <input
          type="text"
          value={representativeName}
          onChange={(e) => onRepresentativeNameChange(e.target.value)}
          placeholder={isCoRepresentative ? '홍길동, 김철수' : '대표자명을 입력해주세요'}
          maxLength={100}
          className={inputCls(representativeNameError)}
        />
      </FormField>
    </>
  );
}
