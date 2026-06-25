const cls = (error?: string) =>
  `h-11 w-full px-4 rounded-lg border text-sm outline-none focus:border-primary transition-colors disabled:bg-gray-50 disabled:text-gray-text ${
    error ? 'border-red-400 bg-red-50' : 'border-border'
  }`;

const BANKS = [
  '국민은행', '신한은행', '우리은행', '하나은행', '농협은행',
  '기업은행', 'SC제일은행', '씨티은행', '카카오뱅크', '토스뱅크', '케이뱅크', '우체국',
];

interface Props {
  bankName: string;
  onBankNameChange: (v: string) => void;
  bankNameError?: string;
  bankAccount: string;
  onBankAccountChange: (v: string) => void;
  bankAccountError?: string;
}

export default function SellerBankFields({
  bankName, onBankNameChange, bankNameError,
  bankAccount, onBankAccountChange, bankAccountError,
}: Props) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">정산 은행 <span className="text-red-500">*</span></label>
        <select value={bankName} onChange={(e) => onBankNameChange(e.target.value)} className={cls(bankNameError)}>
          <option value="">은행을 선택해주세요</option>
          {BANKS.map((bank) => <option key={bank} value={bank}>{bank}</option>)}
        </select>
        {bankNameError && <p className="text-xs text-red-500">{bankNameError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">정산 계좌번호 <span className="text-red-500">*</span></label>
        <input type="text" value={bankAccount}
          onChange={(e) => onBankAccountChange(e.target.value.replace(/\D/g, ''))}
          placeholder="계좌번호를 입력해주세요 (- 없이)" maxLength={50} className={cls(bankAccountError)} />
        {bankAccountError && <p className="text-xs text-red-500">{bankAccountError}</p>}
      </div>
    </>
  );
}
