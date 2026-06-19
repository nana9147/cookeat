import { Clock, Users, Flame } from 'lucide-react';
import type { ReactNode } from 'react';

interface MetaCardProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function MetaCard({ icon, label, value }: MetaCardProps) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 py-3 bg-card-bg rounded-xl">
      <div className="text-primary">{icon}</div>
      <p className="text-xs text-gray-text">{label}</p>
      <p className="text-sm font-semibold text-dark-text">{value}</p>
    </div>
  );
}

interface RecipeMetaRowProps {
  cookTime: number;
  servings: number;
  calories: number;
  rating: number;
}

export default function RecipeMetaRow({ cookTime, servings, calories, rating }: RecipeMetaRowProps) {
  return (
    <div className="flex gap-2 mb-6">
      <MetaCard icon={<Clock className="w-5 h-5" />} label="조리시간" value={`${cookTime}분`} />
      <MetaCard icon={<Users className="w-5 h-5" />} label="인분" value={`${servings}인분`} />
      <MetaCard icon={<span className="text-yellow text-lg leading-none">★</span>} label="별점" value={rating.toFixed(1)} />
      <MetaCard icon={<Flame className="w-5 h-5" />} label="칼로리" value={`${calories}Kcal`} />
    </div>
  );
}
