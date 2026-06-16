import { SearchIcon } from './HeaderIcons';

export default function SidebarSearch() {
  return (
    <div className="px-6 py-4 border-b border-border">
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="레시피를 검색해보세요"
          className="w-full h-10 px-4 pr-11 rounded-full border border-border bg-white text-dark-text placeholder:text-light-gray text-sm outline-none focus:border-primary transition-colors"
        />
        <button className="absolute right-3 text-gray-text hover:text-primary transition-colors">
          <SearchIcon size={20} />
        </button>
      </div>
    </div>
  );
}
