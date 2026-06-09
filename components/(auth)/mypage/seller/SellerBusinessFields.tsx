import { formatBusinessNumber } from '@/hooks/user/useSellerApplyForm';
import AddressField from './AddressField';

const cls = (error?: string) =>
  `h-11 w-full px-4 rounded-lg border text-sm outline-none focus:border-primary transition-colors disabled:bg-gray-50 disabled:text-gray-text ${
    error ? 'border-red-400 bg-red-50' : 'border-border'
  }`;

interface Props {
  storeName: string;
  onStoreNameChange: (v: string) => void;
  storeNameError?: string;
  businessNumber: string;
  onBusinessNumberChange: (v: string) => void;
  businessNumberError?: string;
  onAddressChange: (v: string) => void;
}

export default function SellerBusinessFields({
  storeName, onStoreNameChange, storeNameError,
  businessNumber, onBusinessNumberChange, businessNumberError,
  onAddressChange,
}: Props) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">상호명 <span className="text-red-500">*</span></label>
        <input type="text" value={storeName} onChange={(e) => onStoreNameChange(e.target.value)}
          placeholder="상호명을 입력해주세요" maxLength={100} className={cls(storeNameError)} />
        {storeNameError && <p className="text-xs text-red-500">{storeNameError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">사업자 번호 <span className="text-red-500">*</span></label>
        <input type="text" value={businessNumber}
          onChange={(e) => onBusinessNumberChange(formatBusinessNumber(e.target.value))}
          placeholder="000-00-00000" maxLength={12} className={cls(businessNumberError)} />
        {businessNumberError && <p className="text-xs text-red-500">{businessNumberError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">사업장 주소</label>
        <AddressField onChange={onAddressChange} />
      </div>
    </>
  );
}
