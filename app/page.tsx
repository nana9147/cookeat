import HeroSection from '@/components/home/HeroSection';
import PopularRecipeSection from '@/components/home/PopularRecipeSection';
import CategorySection from '@/components/home/CategorySection';
import UserPointCard from '@/components/home/UserPointCard';
import TodayRecipeCard from '@/components/home/TodayRecipeCard';
import EventBanner from '@/components/home/EventBanner';

export default function Home() {
  return (
    <>
      <main className="px-4 md:px-6 lg:px-8 py-6 bg-[#F7F4ED] min-h-screen">
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div>
            <HeroSection />
            <PopularRecipeSection />
            <CategorySection />
          </div>

          <div className="flex flex-col gap-4">
            <UserPointCard />

            <TodayRecipeCard />
            <EventBanner />
          </div>
        </section>
      </main>

      <footer className="bg-[#3E6B47] text-white">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-bold whitespace-nowrap">Cookeat</p>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span>♡</span>
              <span>신뢰할 수 있는 레시피</span>
            </div>

            <div className="flex items-center gap-2">
              <span>🛒</span>
              <span>안전한 재료 쇼핑</span>
            </div>

            <div className="flex items-center gap-2">
              <span>🎁</span>
              <span>다양한 혜택</span>
            </div>

            <div className="flex items-center gap-2">
              <span>👥</span>
              <span>함께하는 커뮤니티</span>
            </div>
          </div>

          <p className="text-xs whitespace-nowrap">© 2024 Cookeat. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
