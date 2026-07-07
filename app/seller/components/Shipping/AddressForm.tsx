import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AddressFormProps } from '@/types/seller/shipping';
import { useState } from 'react';
import DaumPostcode from 'react-daum-postcode';

export default function AddressForm({
  mode,
  address,
  defaultType,
  isLastDefaultAddress,
  isOpen,
  onClose,
  onSubmit,
}: AddressFormProps) {
  const [form, setForm] = useState({
    type: address?.type ?? defaultType ?? '출고지',
    name: address?.name ?? '',
    zipCode: address?.zipCode ?? '',
    baseAddress: address?.baseAddress ?? '',
    detailAddress: address?.detailAddress ?? '',
    isDefault: address?.isDefault ?? false,
  });
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

  const [prevSync, setPrevSync] = useState({ isOpen, address, defaultType });
  if (
    prevSync.isOpen !== isOpen ||
    prevSync.address !== address ||
    prevSync.defaultType !== defaultType
  ) {
    setPrevSync({ isOpen, address, defaultType });
    if (!isOpen) {
      setIsPostcodeOpen(false);
    } else {
      setForm({
        type: address?.type ?? defaultType ?? '출고지',
        name: address?.name ?? '',
        zipCode: address?.zipCode ?? '',
        baseAddress: address?.baseAddress ?? '',
        detailAddress: address?.detailAddress ?? '',
        isDefault: address?.isDefault ?? false,
      });
    }
  }

  const handleSubmit = () => {
    if (!form.name || !form.zipCode || !form.baseAddress) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    onSubmit(form);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === '등록' ? '주소 등록' : '주소 수정'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* 용도 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              용도 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={form.type === '출고지' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setForm({ ...form, type: '출고지' })}
              >
                출고지
              </Button>
              <Button
                type="button"
                variant={form.type === '반품지' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setForm({ ...form, type: '반품지' })}
              >
                반품지
              </Button>
            </div>
          </div>

          {/* 주소 별칭 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              주소 별칭 <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="예) 본사 창고, 경기 물류센터"
            />
          </div>

          {/* 우편번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              우편번호 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 max-mobile:flex-wrap">
              <Input value={form.zipCode} readOnly className="w-32 max-mobile:w-full" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPostcodeOpen((prev) => !prev)}
              >
                우편번호 검색
              </Button>
            </div>
            {isPostcodeOpen && (
              <div className="mt-2">
                <div className="flex justify-end mb-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPostcodeOpen(false)}
                  >
                    닫기
                  </Button>
                </div>
                <DaumPostcode
                  className="mt-2 rounded-lg"
                  style={{
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  onComplete={(data) => {
                    setForm({ ...form, zipCode: data.zonecode, baseAddress: data.address });
                    setIsPostcodeOpen(false);
                  }}
                  onClose={() => setIsPostcodeOpen(false)}
                />
              </div>
            )}
          </div>

          {/* 기본 주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              기본 주소 <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.baseAddress}
              onChange={(e) => setForm({ ...form, baseAddress: e.target.value })}
              readOnly
            />
          </div>

          {/* 상세 주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상세 주소</label>
            <Input
              value={form.detailAddress}
              onChange={(e) => setForm({ ...form, detailAddress: e.target.value })}
              placeholder="예) 4층, 창고동"
            />
          </div>

          {/* 기본 주소 설정 */}
          <label
            className={`flex items-center gap-2 ${
              isLastDefaultAddress ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              checked={form.isDefault}
              disabled={isLastDefaultAddress}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="accent-green-600 w-4 h-4"
            />
            <span className="text-sm text-gray-700">기본 주소로 설정</span>
          </label>
          {isLastDefaultAddress && (
            <p className="text-xs text-muted-foreground">
              출고지/반품지에는 최소 1개의 기본 주소가 필요해 해제할 수 없습니다.
            </p>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border mt-2">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSubmit}>{mode === '등록' ? '등록하기' : '수정하기'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
