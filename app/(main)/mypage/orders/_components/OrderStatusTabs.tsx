const STATUS_TABS = ['전체', '결제완료', '배송중', '배송완료'] as const;
export type StatusTab = (typeof STATUS_TABS)[number];

type Props = { activeTab: StatusTab; onTabChange: (tab: StatusTab) => void };

export default function OrderStatusTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {STATUS_TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeTab === tab
              ? 'bg-primary text-white'
              : 'bg-beige text-gray-text hover:bg-primary/10'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
