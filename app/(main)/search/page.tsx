import { Suspense } from 'react';
import SearchClient from './_components/SearchClient';

interface Props {
  searchParams: Promise<{ keyword?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { keyword = '' } = await searchParams;
  return (
    <div className="max-w-360 mx-auto px-4 tablet:px-6 desktop:px-10 py-6">
      <h2 className="text-xl font-bold text-dark-text mb-1">
        {keyword ? `"${keyword}" 검색 결과` : '검색'}
      </h2>
      <Suspense>
        <SearchClient keyword={keyword} />
      </Suspense>
    </div>
  );
}
