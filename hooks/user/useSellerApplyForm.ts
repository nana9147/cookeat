'use client';

import { useState } from 'react';

export interface SellerApplyFields {
  isCoRepresentative: boolean;
  representativeName: string;
  csPhone: string;
  storeName: string;
  businessNumber: string;
  businessAddress: string;
  bankName: string;
  bankAccount: string;
}

interface Errors {
  representativeName?: string;
  csPhone?: string;
  storeName?: string;
  businessNumber?: string;
  businessAddress?: string;
  bankName?: string;
  bankAccount?: string;
}

export function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function formatBusinessNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

export function useSellerApplyForm(onSubmit?: (fields: SellerApplyFields) => Promise<boolean>) {
  const [isCoRepresentative, setIsCoRepresentative] = useState(false);
  const [representativeName, setRepresentativeName] = useState('');
  const [csPhone, setCsPhone] = useState('');
  const [storeName, setStoreName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  function clearError(key: keyof Errors) {
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!representativeName.trim()) e.representativeName = '대표자명을 입력해주세요.';
    if (!csPhone.trim()) {
      e.csPhone = '고객센터 전화번호를 입력해주세요.';
    } else if (!/^\d{3}-\d{3,4}-\d{4}$/.test(csPhone)) {
      e.csPhone = '올바른 전화번호 형식으로 입력해주세요.';
    }
    if (!storeName.trim()) e.storeName = '상호명을 입력해주세요.';
    if (!businessNumber.trim()) {
      e.businessNumber = '사업자 번호를 입력해주세요.';
    } else if (!/^\d{3}-\d{2}-\d{5}$/.test(businessNumber)) {
      e.businessNumber = '000-00-00000 형식으로 입력해주세요.';
    }
    if (!businessAddress.trim()) e.businessAddress = '사업장 주소를 입력해주세요.';
    if (!bankName) e.bankName = '정산 은행을 선택해주세요.';
    if (!bankAccount.trim()) {
      e.bankAccount = '계좌번호를 입력해주세요.';
    } else if (!/^\d+$/.test(bankAccount)) {
      e.bankAccount = '숫자만 입력해주세요.';
    }
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    await onSubmit?.({ isCoRepresentative, representativeName, csPhone, storeName, businessNumber, businessAddress, bankName, bankAccount });
  }

  return {
    isCoRepresentative, setIsCoRepresentative,
    representativeName, setRepresentativeName,
    csPhone, setCsPhone,
    storeName, setStoreName,
    businessNumber, setBusinessNumber,
    businessAddress, setBusinessAddress,
    bankName, setBankName,
    bankAccount, setBankAccount,
    errors, clearError, handleSubmit,
  };
}
