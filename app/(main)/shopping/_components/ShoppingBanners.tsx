import { ShoppingCart, Truck, Tag } from 'lucide-react';

const banners = [
  {
    icon: ShoppingCart,
    title: '3만원 이상 무료배송',
    desc: '오늘 주문하면 최대 50% 할인',
    bg: 'bg-primary',
    textColor: 'text-white',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
  },
  {
    icon: Truck,
    title: '선착순 신선배달',
    desc: '매일 아침 6시 수확 당일 배송',
    bg: 'bg-beige',
    textColor: 'text-dark-text',
    iconBg: 'bg-white',
    iconColor: 'text-primary',
  },
  {
    icon: Tag,
    title: '최대 30% 할인',
    desc: '오늘만 특별 할인 이벤트',
    bg: 'bg-[#FFF3DC]',
    textColor: 'text-dark-text',
    iconBg: 'bg-yellow/20',
    iconColor: 'text-yellow',
  },
];

export default function ShoppingBanners() {
  return (
    <div className="grid grid-cols-1 tablet:grid-cols-3 gap-3 mb-6">
      {banners.map(({ icon: Icon, title, desc, bg, textColor, iconBg, iconColor }) => (
        <div
          key={title}
          className={`flex items-center gap-3 rounded-xl px-4 py-3.5 ${bg} cursor-pointer`}
        >
          <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <p className={`text-sm font-bold ${textColor}`}>{title}</p>
            <p className={`text-xs mt-0.5 ${textColor} opacity-70`}>{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
