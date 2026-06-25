import { formatBusinessNumber, formatPhoneNumber } from '@/hooks/user/useSellerApplyForm';
import AddressField from './AddressField';
import FormField, { inputCls } from './FormField';

interface Props {
  csPhone: string;
  onCsPhoneChange: (v: string) => void;
  csPhoneError?: string;
  storeName: string;
  onStoreNameChange: (v: string) => void;
  storeNameError?: string;
  businessNumber: string;
  onBusinessNumberChange: (v: string) => void;
  businessNumberError?: string;
  onAddressChange: (v: string) => void;
  addressError?: string;
}

export default function SellerBusinessFields({
  csPhone, onCsPhoneChange, csPhoneError,
  storeName, onStoreNameChange, storeNameError,
  businessNumber, onBusinessNumberChange, businessNumberError,
  onAddressChange, addressError,
}: Props) {
  return (
    <>
      <FormField label="고객센터 전화번호" required error={csPhoneError}>
        <input type="text" value={csPhone} onChange={(e) => onCsPhoneChange(formatPhoneNumber(e.target.value))} placeholder="010-0000-0000" maxLength={13} className={inputCls(csPhoneError)} />
      </FormField>

      <FormField label="상호명" required error={storeNameError}>
        <input type="text" value={storeName} onChange={(e) => onStoreNameChange(e.target.value)} placeholder="상호명을 입력해주세요" maxLength={100} className={inputCls(storeNameError)} />
      </FormField>

      <FormField label="사업자 번호" required error={businessNumberError}>
        <input type="text" value={businessNumber} onChange={(e) => onBusinessNumberChange(formatBusinessNumber(e.target.value))} placeholder="000-00-00000" maxLength={12} className={inputCls(businessNumberError)} />
      </FormField>

      <FormField label="사업장 주소" required error={addressError}>
        <AddressField onChange={onAddressChange} />
      </FormField>
    </>
  );
}
