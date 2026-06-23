'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FormType, AddressItem } from '@/types/seller/shipping';
import { Plus, MapPinOff } from 'lucide-react';
import { useState } from 'react';
import AddressCard from './AddressCard';
import AddressForm from './AddressForm';

const MOCK_ADDRESSES: AddressItem[] = [
  {
    id: 1,
    name: '본사 창고',
    zipCode: '06234',
    baseAddress: '서울시 강남구 테헤란로 123',
    detailAddress: '4층',
    type: '출고지',
    isDefault: true,
  },
  {
    id: 2,
    name: '사무실',
    zipCode: '06234',
    baseAddress: '서울시 강남구 테헤란로 123',
    detailAddress: '2층',
    type: '출고지',
    isDefault: false,
  },
];

export default function AddressList() {
  const [addresses, setAddresses] = useState<AddressItem[]>(MOCK_ADDRESSES);
  const [isOpen, setIsOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormType>('등록');
  const [selectedAddress, setSelectedAddress] = useState<AddressItem | undefined>(undefined);

  const origins = addresses.filter((a) => a.type === '출고지');
  const returns = addresses.filter((a) => a.type === '반품지');

  const handleSubmit = (form: Omit<AddressItem, 'id'>) => {
    if (formMode === '등록') {
      const newAddress = { ...form, id: Date.now() };
      setAddresses((prev) =>
        prev
          .map((a) => (a.type === form.type && form.isDefault ? { ...a, isDefault: false } : a))
          .concat(newAddress)
      );
    } else {
      setAddresses((prev) =>
        prev.map((a) => {
          if (a.id === selectedAddress?.id) return { ...a, ...form };
          if (a.type === form.type && form.isDefault) return { ...a, isDefault: false };
          return a;
        })
      );
    }
    setIsOpen(false);
  };

  const handleDelete = (id: number) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <>
      <div className="flex justify-between items-center bg-white border border-border rounded-lg p-5 mb-5">
        <div>
          <p className="text-h4 font-medium">주소 관리</p>
          <span className="text-sm text-light-gray">
            출고지/반품지로 사용할 주소를 등록하고 관리하세요.
          </span>
        </div>
        <Button
          variant="outline"
          className="p-5"
          onClick={() => {
            setFormMode('등록');
            setSelectedAddress(undefined);
            setIsOpen(true);
          }}
        >
          <Plus />
          주소 등록
        </Button>
      </div>
      <Tabs defaultValue="origin">
        <div className="flex items-center justify-between mb-4 border-b border-border">
          <TabsList variant="line">
            <TabsTrigger
              value="origin"
              className="p-3 after:bg-primary data-active:text-emerald-500"
            >
              출고지
            </TabsTrigger>
            <TabsTrigger
              value="return"
              className="p-3 after:bg-primary data-active:text-emerald-500"
            >
              반품지
            </TabsTrigger>
          </TabsList>
        </div>
        {/* 출고지 */}
        <TabsContent value="origin">
          {origins.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
              <MapPinOff className="mb-4 size-10 text-muted-foreground" />

              <p className="mb-1 text-sm font-medium text-foreground">등록된 출고지가 없습니다.</p>

              <p className="text-sm text-muted-foreground">주소 등록 버튼을 눌러 추가해보세요</p>
            </div>
          ) : (
            origins.map((a) => (
              <AddressCard
                key={a.id}
                address={a}
                onEdit={() => {
                  setFormMode('수정');
                  setSelectedAddress(a);
                  setIsOpen(true);
                }}
                onDelete={() => handleDelete(a.id)}
              />
            ))
          )}
        </TabsContent>

        {/* 반품지 */}
        <TabsContent value="return">
          {returns.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
              <MapPinOff className="mb-4 size-10 text-muted-foreground" />

              <p className="mb-1 text-sm font-medium text-foreground">등록된 반품지가 없습니다.</p>

              <p className="text-sm text-muted-foreground">주소 등록 버튼을 눌러 추가해보세요</p>
            </div>
          ) : (
            returns.map((a) => (
              <AddressCard
                key={a.id}
                address={a}
                onEdit={() => {
                  setFormMode('수정');
                  setSelectedAddress(a);
                  setIsOpen(true);
                }}
                onDelete={() => handleDelete(a.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
      <AddressForm
        mode={formMode}
        address={selectedAddress}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
