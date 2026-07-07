import { useState } from 'react';

export function useFilter<T>(items: T[], filterFn: (item: T, search: string) => boolean) {
  const [search, setSearch] = useState('');

  const filtered = items.filter((item) => filterFn(item, search));

  return { search, setSearch, filtered };
}
