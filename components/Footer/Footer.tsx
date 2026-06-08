'use client';

import { RecipeIcon, ShoppingIcon, BenefitIcon, CommunityIcon } from './FooterIcons';

export default function Footer() {
  return (
    <footer className="w-full bg-primary shrink-0">
      <div className="max-w-360 mx-auto px-25 flex flex-col gap-4 py-6 desktop:flex-row desktop:items-center desktop:justify-between desktop:h-24 desktop:py-0 desktop:gap-7">
        <div className="flex items-center gap-4 desktop:gap-8">
          <h2 className="text-white font-bold text-h5 tablet:text-h3" suppressHydrationWarning>Cookeat</h2>
          <p className="hidden desktop:block text-footer-sub text-sm">© 2026 Cookeat. All rights reserved.</p>
        </div>

        <div className="flex flex-col gap-2 desktop:flex-row desktop:items-center desktop:gap-7">
          <div className="flex items-center gap-2">
            <RecipeIcon />
            <h3 className="text-footer-text text-2xs tablet:text-h5" suppressHydrationWarning>신뢰할 수 있는 레시피</h3>
          </div>
          <div className="flex items-center gap-2">
            <ShoppingIcon />
            <h3 className="text-footer-text text-2xs tablet:text-h5" suppressHydrationWarning>안전한 재료 쇼핑</h3>
          </div>
          <div className="flex items-center gap-2">
            <BenefitIcon />
            <h3 className="text-footer-text text-2xs tablet:text-h5" suppressHydrationWarning>다양한 혜택</h3>
          </div>
          <div className="flex items-center gap-2">
            <CommunityIcon />
            <h3 className="text-footer-text text-2xs tablet:text-h5" suppressHydrationWarning>함께하는 커뮤니티</h3>
          </div>
        </div>

        <p className="desktop:hidden text-footer-sub text-xs">
          © 2026 Cookeat.<br className="tablet:hidden" /> All rights reserved.
        </p>
      </div>
    </footer>
  );
}
