'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const menuItems = [
  '대시보드',
  '회원관리',
  '판매자관리',
  '상품관리',
  '주문관리',
  '정산관리',
  '레시피/포인트',
  '카테고리',
  '리뷰/신고',
  '고객센터',
  '통계/분석',
];

export default function AdminMobileNav() {
  const [active, setActive] = useState('대시보드');
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden w-full bg-white border-b">
      <button
        className="flex w-full items-center justify-between px-4 py-3 font-medium"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{active}</span>
        <ChevronDown
          size={18}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="flex flex-col border-t">
          {menuItems.map((item) => (
            <button
              key={item}
              className={`px-4 py-3 text-left text-sm transition-colors ${
                active === item ? 'bg-primary text-white' : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                setActive(item);
                setOpen(false);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
