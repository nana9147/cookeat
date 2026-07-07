export default function Header() {
  return (
    <>
      <header className="bg-dark-text h-25 max-tablet:h-20 max-mobile:h-16 border-b border-border">
        <div className="max-w-360 text-white mx-10 max-tablet:mx-6 max-mobile:mx-4 font-bold h-full flex flex-col justify-center text-[20px] max-tablet:text-base max-mobile:text-sm">
          <span>Cookeat 관리자</span>
          <p className="text-gray-text text-[14px] max-tablet:text-xs font-normal">
            Administrator Dashboard
          </p>
        </div>
      </header>
    </>
  );
}
