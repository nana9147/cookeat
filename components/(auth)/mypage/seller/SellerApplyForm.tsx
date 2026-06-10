'use client';

import { useSellerApplyForm, type SellerApplyFields } from '@/hooks/user/useSellerApplyForm';
import SellerRepresentativeFields from './SellerRepresentativeFields';
import SellerBusinessFields from './SellerBusinessFields';
import SellerBankFields from './SellerBankFields';

interface Props {
  isRejected?: boolean;
  rejectedReason?: string;
  submitting?: boolean;
  submitError?: string;
  onSubmit?: (fields: SellerApplyFields) => Promise<boolean>;
}

export default function SellerApplyForm({ isRejected, rejectedReason, submitting, submitError, onSubmit }: Props) {
  const {
    isCoRepresentative, setIsCoRepresentative,
    representativeName, setRepresentativeName,
    csPhone, setCsPhone,
    storeName, setStoreName,
    businessNumber, setBusinessNumber,
    setBusinessAddress,
    bankName, setBankName,
    bankAccount, setBankAccount,
    errors, clearError, handleSubmit,
  } = useSellerApplyForm(onSubmit);

  return (
    <div>
      <h3 className="mb-1 font-bold text-dark-text">판매자 신청</h3>
      <p className="mb-6 text-sm text-gray-text">아래 정보를 입력하면 관리자 검토 후 판매자로 승인됩니다.</p>

      {isRejected && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">신청이 반려되었습니다</p>
          {rejectedReason && <p className="mt-1 text-xs text-red-500">{rejectedReason}</p>}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-5">
        <SellerRepresentativeFields
          isCoRepresentative={isCoRepresentative} onIsCoRepresentativeChange={setIsCoRepresentative}
          representativeName={representativeName} onRepresentativeNameChange={(v: string) => { setRepresentativeName(v); clearError('representativeName'); }} representativeNameError={errors.representativeName}
        />

        <SellerBusinessFields
          csPhone={csPhone} onCsPhoneChange={(v: string) => { setCsPhone(v); clearError('csPhone'); }} csPhoneError={errors.csPhone}
          storeName={storeName} onStoreNameChange={(v: string) => { setStoreName(v); clearError('storeName'); }} storeNameError={errors.storeName}
          businessNumber={businessNumber} onBusinessNumberChange={(v: string) => { setBusinessNumber(v); clearError('businessNumber'); }} businessNumberError={errors.businessNumber}
          onAddressChange={(v: string) => { setBusinessAddress(v); clearError('businessAddress'); }} addressError={errors.businessAddress}
        />

        <hr className="border-border" />

        <SellerBankFields
          bankName={bankName} onBankNameChange={(v) => { setBankName(v); clearError('bankName'); }} bankNameError={errors.bankName}
          bankAccount={bankAccount} onBankAccountChange={(v) => { setBankAccount(v); clearError('bankAccount'); }} bankAccountError={errors.bankAccount}
        />

        {submitError && <p className="text-xs text-red-500">{submitError}</p>}

        <button type="submit" disabled={submitting}
          className="h-11 w-full rounded-lg bg-primary text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? '신청 중...' : isRejected ? '재신청하기' : '신청하기'}
        </button>
      </form>
    </div>
  );
}
