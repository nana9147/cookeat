export default function Header() {
  return (
    <>
      <header className="bg-dark-text h-25 border-b border-border">
        <div className="max-w-360 text-white mx-10 font-bold h-full flex flex-col justify-center text-[20px]">
          <span>Cookeat 관리자</span>
          <p className="text-gray-text text-[14px] font-normal">Administrator Dashboard</p>
        </div>
      </header>
    </>
  );
}
