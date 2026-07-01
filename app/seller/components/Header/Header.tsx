import LowStockAlert from './LowStockAlert';

export default function Header() {
  return (
    <header className="bg-dark-text h-25">
      <div className="max-w-360 text-white mx-10 h-full flex items-center justify-between">
        <div className="font-bold flex flex-col justify-center text-[20px]">
          <span>Cookeat 판매자센터</span>
          <p className="text-gray-text text-[14px] font-normal">Seller Dashboard</p>
        </div>
        <LowStockAlert />
      </div>
    </header>
  );
}
