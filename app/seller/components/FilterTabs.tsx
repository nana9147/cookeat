'use client';

interface FilterTabsProps<T extends string> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
}
export default function FilterTabs<T extends string>({
  options,
  value,
  onChange,
}: FilterTabsProps<T>) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            value === option
              ? 'bg-primary text-primary-foreground'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

