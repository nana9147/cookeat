interface ApplyBody {
  storeName?: string;
  businessNumber?: string;
  businessAddress?: string;
  bankName?: string;
  bankAccount?: string;
}

export function validateApplyBody(body: ApplyBody): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!body.storeName?.trim()) {
    errors.storeName = '상호명을 입력해주세요.'
  } else if (body.storeName.trim().length > 100) {
    errors.storeName = '상호명은 100자 이하로 입력해주세요.'
  }

  if (!body.businessNumber?.trim()) {
    errors.businessNumber = '사업자 번호를 입력해주세요.'
  } else if (!/^\d{3}-\d{2}-\d{5}$/.test(body.businessNumber.trim())) {
    errors.businessNumber = '사업자 번호 형식이 올바르지 않습니다. (000-00-00000)'
  }

  if (body.businessAddress && body.businessAddress.trim().length > 300) {
    errors.businessAddress = '사업장 주소는 300자 이하로 입력해주세요.'
  }

  if (!body.bankName?.trim()) {
    errors.bankName = '정산 은행을 선택해주세요.'
  }

  if (!body.bankAccount?.trim()) {
    errors.bankAccount = '계좌번호를 입력해주세요.'
  } else if (!/^\d+$/.test(body.bankAccount.trim())) {
    errors.bankAccount = '계좌번호는 숫자만 입력해주세요.'
  } else if (body.bankAccount.trim().length > 50) {
    errors.bankAccount = '계좌번호는 50자 이하로 입력해주세요.'
  }

  return errors
}
