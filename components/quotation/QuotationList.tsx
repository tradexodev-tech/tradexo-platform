import type { QuotationWithRFQ } from "@/types/quotation";

import QuotationCard from "@/components/quotation/QuotationCard";

type QuotationListProps = {
  quotations: QuotationWithRFQ[];
  withdrawingId?: string | null;
  onEdit?: (quotation: QuotationWithRFQ) => void;
  onWithdraw?: (quotation: QuotationWithRFQ) => void;
};

export default function QuotationList({
  quotations,
  withdrawingId,
  onEdit,
  onWithdraw,
}: QuotationListProps) {
  return (
    <div className="space-y-4">
      {quotations.map((quotation) => (
        <QuotationCard
          key={quotation.id}
          quotation={quotation}
          withdrawing={withdrawingId === quotation.id}
          onEdit={onEdit}
          onWithdraw={onWithdraw}
        />
      ))}
    </div>
  );
}
