'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import type { AddressCardProps } from '@/types/seller/shipping';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AddressCard({ address, onEdit, onDelete }: AddressCardProps) {
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <Card className="p-5 mb-3">
        <div className="flex items-start gap-3">
          <MapPin className="text-emerald-500 mt-1 shrink-0" />
          <CardContent className="flex justify-between flex-1 p-0">
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <p className="text-h5 font-medium">{address.name}</p>
                {address.isDefault && (
                  <StatusBadge status={address.type === '출고지' ? '기본출고지' : '기본반품지'} />
                )}
              </div>
              <div className="flex gap-3 text-sm text-gray-600">
                ({address.zipCode}) {address.baseAddress}, {address.detailAddress}
              </div>
            </div>
            {!isAdmin && (
              <div className="flex">
                <Button variant="ghost" onClick={onEdit}>
                  <Pencil />
                </Button>
                <Button variant="ghost" onClick={() => setIsDeleteOpen(true)}>
                  <Trash2 />
                </Button>
              </div>
            )}
          </CardContent>
        </div>
      </Card>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>주소를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              [{address.name}] 주소가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
