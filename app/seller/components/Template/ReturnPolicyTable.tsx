'use client';

import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { ReturnPolicyTableProps } from '@/types/seller/shipping';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function ReturnPolicyTable({
  policies,
  onEdit,
  onDelete,
  onSetDefault,
}: ReturnPolicyTableProps) {
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin');
  const defaultId = policies.find((s) => s.isDefault)?.returnId ?? null;
  const [selectedId, setSelectedId] = useState<number | null>(defaultId);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [isDefaultConfirmOpen, setIsDefaultConfirmOpen] = useState(false);
  const [prevPolicies, setPrevPolicies] = useState(policies);

  if (policies !== prevPolicies) {
    setPrevPolicies(policies);
    setSelectedId(defaultId);
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden py-3">
        <RadioGroup
          value={selectedId !== null ? String(selectedId) : ''}
          onValueChange={(value) => setSelectedId(Number(value))}
        >
          <div className="overflow-x-auto whitespace-nowrap">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">기본</TableHead>
                  <TableHead className="text-center">템플릿명</TableHead>
                  <TableHead className="text-center">반품 가능 기간</TableHead>
                  <TableHead className="text-center">환불 처리</TableHead>
                  <TableHead className="w-20 text-center">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.length === 0 ? (
                  <TableRow>
                    <TableCell>등록된 교환/환불 규정 템플릿이 없습니다.</TableCell>
                  </TableRow>
                ) : (
                  policies.map((policy) => (
                    <TableRow
                      key={policy.returnId}
                      className="cursor-pointer"
                      onClick={() => setSelectedId(policy.returnId)}
                    >
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <RadioGroupItem value={String(policy.returnId)} />
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-gray-700">{policy.name}</TableCell>
                      <TableCell className="text-center text-gray-700">
                        {policy.content.returnPeriod}일
                      </TableCell>

                      <TableCell className="text-center text-gray-700">
                        {policy.content.refundPeriod}일
                      </TableCell>
                      <TableCell className="text-center">
                        {!isAdmin ? (
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(policy);
                              }}
                            >
                              <Pencil size={15} className="text-gray-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(policy.returnId);
                              }}
                            >
                              <Trash2 size={15} className="text-red-400" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </RadioGroup>
        {!isAdmin && (
          <div className="flex justify-end px-4 pt-3">
            <Button onClick={() => setIsDefaultConfirmOpen(true)}>저장</Button>
          </div>
        )}
      </div>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>해당 템플릿을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              [{policies.find((s) => s.returnId === deleteTarget)?.name}] 템플릿이 삭제됩니다. 이
              작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget !== null) onDelete(deleteTarget);
                setDeleteTarget(null);
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={isDefaultConfirmOpen} onOpenChange={setIsDefaultConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기본 템플릿을 변경하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              [{policies.find((s) => s.returnId === selectedId)?.name}] 템플릿이 기본값으로
              설정됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedId(defaultId)}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedId !== null) onSetDefault(selectedId);
                setIsDefaultConfirmOpen(false);
              }}
            >
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
