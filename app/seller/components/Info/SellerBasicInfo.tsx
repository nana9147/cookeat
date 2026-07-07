'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SellerApplicationProps } from '@/types/seller/seller';
import StatusBadge from '../StatusBadge';

export default function SellerBasicInfo({ data, isEditing, onChange }: SellerApplicationProps) {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-h5 font-semibold text-dark-text">상점 정보</CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <dl className="flex flex-col gap-4">
          <div className="grid grid-cols-[160px_1fr] items-center max-mobile:grid-cols-1 max-mobile:gap-1">
            <dt className="text-sm text-gray-400">상점명</dt>
            <dd className="text-sm text-gray-800">
              {isEditing ? (
                <Input
                  value={data.store_name}
                  onChange={(e) => onChange({ store_name: e.target.value })}
                  className="max-w-sm"
                />
              ) : (
                data.store_name
              )}
            </dd>
          </div>
          <div className="grid grid-cols-[160px_1fr] items-center max-mobile:grid-cols-1 max-mobile:gap-1">
            <dt className="text-sm text-gray-400">CS 연락처</dt>
            <dd className="text-sm text-gray-800">
              {isEditing ? (
                <Input
                  value={data.cs_phone}
                  onChange={(e) => onChange({ cs_phone: e.target.value })}
                  className="max-w-sm"
                />
              ) : (
                data.cs_phone
              )}
            </dd>
          </div>
          <div className="grid grid-cols-[160px_1fr] items-center max-mobile:grid-cols-1 max-mobile:gap-1">
            <dt className="text-sm text-gray-400">승인 상태</dt>
            <dd>
              <StatusBadge status={data.approve_status} />
            </dd>
          </div>
          {data.approve_status === 'rejected' && (
            <div className="grid grid-cols-[160px_1fr] items-start max-mobile:grid-cols-1 max-mobile:gap-1">
              <dt className="text-sm text-gray-400 pt-0.5">승인 거절 사유</dt>
              <dd className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {data.rejected_reason}
              </dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
