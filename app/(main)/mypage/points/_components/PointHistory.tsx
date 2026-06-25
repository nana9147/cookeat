'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/format';

type PointEntry = { pointId: number; type: string; amount: number; description: string; createdAt: string };

export default function PointHistory() {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<PointEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ balance: number; history: PointEntry[] }>('/users/me/points')
      .then(({ data }) => { setBalance(data.balance); setHistory(data.history); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-bold text-dark-text">포인트</h3>
      <div className="flex items-center justify-between rounded-2xl bg-primary/5 border border-primary/20 p-5">
        <div>
          <p className="text-xs text-gray-text mb-1">현재 보유 포인트</p>
          <p className="text-2xl font-bold text-primary">{balance.toLocaleString()}<span className="text-base ml-1">P</span></p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-dark-text">포인트 내역</p>
        {loading ? (
          <div className="flex flex-col gap-2">{[1,2,3].map((i) => <div key={i} className="h-14 rounded-xl bg-beige animate-pulse" />)}</div>
        ) : history.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-gray-text">포인트 내역이 없습니다.</p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {history.map((entry) => (
              <li key={entry.pointId} className="flex items-center justify-between py-3.5">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm text-dark-text">{entry.description}</p>
                  <p className="text-xs text-gray-text">{formatDate(entry.createdAt)}</p>
                </div>
                <span className={`text-sm font-semibold ${entry.type === '적립' ? 'text-primary' : 'text-red'}`}>
                  {entry.type === '적립' ? '+' : '-'}{entry.amount.toLocaleString()}P
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
