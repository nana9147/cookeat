'use client';

import { useState } from 'react';
import AddressField from './AddressField';

const inputCls = (error?: string) =>
  `h-11 w-full px-4 rounded-lg border text-sm outline-none focus:border-primary transition-colors disabled:bg-gray-50 disabled:text-gray-text ${
    error ? 'border-red-400 bg-red-50' : 'border-border'
  }`;

const BANKS = [
  '국민은행', '신한은행', '우리은행', '하나은행', '농협은행',
  '기업은행', 'SC제일은행', '씨티은행', '카카오뱅크', '토스뱅크', '케이뱅크', '우체국',
];

function formatBusinessNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

interface Errors {
  storeName?: string;
  businessNumber?: string;
  bankName?: string;
  bankAccount?: string;
}

interface Props {
  isRejected?: boolean;
  rejectedReason?: string;
}

export default function SellerApplyForm({ isRejected, rejectedReason }: Props) {
  const [storeName, setStoreName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  function validate(): Errors {
    const e: Errors = {};
    if (!storeName.trim()) e.storeName = '상호명을 입력해주세요.';
    if (!businessNumber.trim()) {
      e.businessNumber = '사업자 번호를 입력해주세요.';
    } else if (!/^\d{3}-\d{2}-\d{5}$/.test(businessNumber)) {
      e.businessNumber = '000-00-00000 형식으로 입력해주세요.';
    }
    if (!bankName) e.bankName = '정산 은행을 선택해주세요.';
    if (!bankAccount.trim()) {
      e.bankAccount = '계좌번호를 입력해주세요.';
    } else if (!/^\d+$/.test(bankAccount)) {
      e.bankAccount = '숫자만 입력해주세요.';
    }
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const e2 = validate();
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;
    // TODO: API 연결
    console.log({ storeName, businessNumber, businessAddress, bankName, bankAccount });
  }

  return (
    <div>
      <h3 className="mb-1 font-bold text-dark-text">판매자 신청</h3>
      <p className="mb-6 text-sm text-gray-text">
        아래 정보를 입력하면 관리자 검토 후 판매자로 승인됩니다.
      </p>

      {isRejected && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">신청이 반려되었습니다</p>
          {rejectedReason && <p className="mt-1 text-xs text-red-500">{rejectedReason}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-dark-text">
            상호명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => { setStoreName(e.target.value); setErrors((prev) => ({ ...prev, storeName: undefined })); }}
            placeholder="상호명을 입력해주세요"
            maxLength={100}
            className={inputCls(errors.storeName)}
          />
          {errors.storeName && <p className="text-xs text-red-500">{errors.storeName}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-dark-text">
            사업자 번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={businessNumber}
            onChange={(e) => {
              setBusinessNumber(formatBusinessNumber(e.target.value));
              setErrors((prev) => ({ ...prev, businessNumber: undefined }));
            }}
            placeholder="000-00-00000"
            maxLength={12}
            className={inputCls(errors.businessNumber)}
          />
          {errors.businessNumber && <p className="text-xs text-red-500">{errors.businessNumber}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-dark-text">사업장 주소</label>
          <AddressField onChange={setBusinessAddress} />
        </div>

        <hr className="border-border" />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-dark-text">
            정산 은행 <span className="text-red-500">*</span>
          </label>
          <select
            value={bankName}
            onChange={(e) => { setBankName(e.target.value); setErrors((prev) => ({ ...prev, bankName: undefined })); }}
            className={inputCls(errors.bankName)}
          >
            <option value="">은행을 선택해주세요</option>
            {BANKS.map((bank) => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
          </select>
          {errors.bankName && <p className="text-xs text-red-500">{errors.bankName}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-dark-text">
            정산 계좌번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={bankAccount}
            onChange={(e) => {
              setBankAccount(e.target.value.replace(/\D/g, ''));
              setErrors((prev) => ({ ...prev, bankAccount: undefined }));
            }}
            placeholder="계좌번호를 입력해주세요 (- 없이)"
            maxLength={50}
            className={inputCls(errors.bankAccount)}
          />
          {errors.bankAccount && <p className="text-xs text-red-500">{errors.bankAccount}</p>}
        </div>

        <button
          type="submit"
          className="h-11 w-full rounded-lg bg-primary text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          {isRejected ? '재신청하기' : '신청하기'}
        </button>
      </form>
    </div>
  );
}
