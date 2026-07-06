'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import InquiryForm from './InquiryForm';
import { formatDateTime } from '@/lib/format';

type InquiryTarget = 'admin' | 'seller';
type Inquiry = { inquiryId: number; category: string; title: string; isAnswered: boolean; createdAt: string; target: InquiryTarget };

const TABS: { key: InquiryTarget; label: string }[] = [
  { key: 'admin', label: '관리자문의' },
  { key: 'seller', label: '판매자문의' },
];

export default function InquiryList() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<InquiryTarget>('admin');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchInquiries = () => {
      setLoading(true);
      api.get<{ inquiries: Inquiry[] }>('/inquiries')
        .then(({ data }) => { if (!cancelled) setInquiries(data.inquiries); })
        .catch(() => { if (!cancelled) setInquiries([]); })
        .finally(() => { if (!cancelled) setLoading(false); });
    };

    fetchInquiries();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const handleSubmitted = () => { setShowForm(false); setRefreshKey((k) => k + 1); };
  const filteredInquiries = inquiries.filter((inq) => inq.target === activeTab);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-dark-text">고객센터</h3>
        {!showForm && activeTab === 'admin' && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-xs text-primary hover:underline">
            <Plus className="w-3.5 h-3.5" />문의하기
          </button>
        )}
      </div>

      {!showForm && (
        <div className="flex gap-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-beige text-gray-text hover:bg-primary/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {showForm && <InquiryForm onSubmitted={handleSubmitted} onCancel={() => setShowForm(false)} />}

      {!showForm && (
        loading ? (
          <div className="flex flex-col gap-2">{[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl bg-beige animate-pulse" />)}</div>
        ) : filteredInquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-gray-text">
              {activeTab === 'admin' ? '문의 내역이 없습니다.' : '상품 상세·주문 상세에서 등록한 문의가 없습니다.'}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {filteredInquiries.map((inq) => (
              <li key={inq.inquiryId}>
                <Link href={`/mypage/support/${inq.inquiryId}`}
                  className="flex items-center justify-between py-4 hover:bg-hover/50 px-1 rounded-lg transition-colors">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 text-xs bg-beige text-gray-text px-2 py-0.5 rounded-full">{inq.category}</span>
                      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${inq.isAnswered ? 'bg-primary/10 text-primary' : 'bg-muted/20 text-muted'}`}>
                        {inq.isAnswered ? '답변완료' : '답변대기'}
                      </span>
                    </div>
                    <p className="text-sm text-dark-text truncate">{inq.title}</p>
                    <p className="text-xs text-gray-text">{formatDateTime(inq.createdAt)}</p>
                  </div>
                  <span className="text-muted shrink-0 ml-2">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
