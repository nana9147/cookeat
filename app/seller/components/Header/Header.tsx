import LowStockAlert from './LowStockAlert';
import HeaderMenuButton from './HeaderMenuButton';

export default function Header() {
  return (
    <header className="bg-dark-text h-25 max-tablet:h-20 max-mobile:h-16">
      <div className="text-white mx-10 max-tablet:mx-6 max-mobile:mx-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeaderMenuButton />
          <div className="font-bold flex flex-col justify-center text-[20px] max-tablet:text-base max-mobile:text-sm">
            <span>Cookeat 판매자센터</span>
            <p className="text-gray-text text-[14px] max-tablet:text-xs font-normal">
              Seller Dashboard
            </p>
          </div>
        </div>
        <LowStockAlert />
      </div>
    </header>
  );
}
