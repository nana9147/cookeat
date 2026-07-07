import HeroSection from '@/components/home/HeroSection';
import PopularRecipeSection from '@/components/home/PopularRecipeSection';
import CategorySection from '@/components/home/CategorySection';
import UserPointCard from '@/components/home/UserPointCard';
import TodayRecipeCard from '@/components/home/TodayRecipeCard';
import EventBanner from '@/components/home/EventBanner';

export default function Home() {
  return (
    <div className="max-w-360 mx-auto px-4 tablet:px-6 desktop:px-10 py-6">
      <section className="grid grid-cols-1 desktop:grid-cols-[1fr_320px] gap-6">
        <div>
          <HeroSection />
          <PopularRecipeSection />
          <CategorySection />
        </div>

        <div className="grid grid-cols-1 tablet:grid-cols-3 desktop:grid-cols-1 gap-4 self-start">
          <UserPointCard />
          <TodayRecipeCard />
          <EventBanner />
        </div>
      </section>
    </div>
  );
}
