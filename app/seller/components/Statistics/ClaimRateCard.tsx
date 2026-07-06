import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { ClaimRateCardProps } from '@/types/seller/statistics';

export default function ClaimRateCard({ claimRate }: ClaimRateCardProps) {
  return (
    <Card className="border-border shadow-sm h-full">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-h5 font-semibold text-dark-text">취소·환불율</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-h3 font-bold text-dark-text max-mobile:text-h4">
          {claimRate.claimRate}%
          <span className="text-sm font-normal text-light-gray ml-2">
            ({claimRate.claimCount}건 / {claimRate.totalCount}건)
          </span>
        </p>
        <div className="flex flex-col gap-2 mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-gray-text">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              구매자귀책
            </span>
            <span className="text-dark-text">{claimRate.buyerFaultCount}건</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-gray-text">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              판매자귀책
            </span>
            <span className="text-dark-text">{claimRate.sellerFaultCount}건</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
