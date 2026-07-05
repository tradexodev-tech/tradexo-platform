import { Eye } from "lucide-react";

import InquiryStatusBadge from "@/components/inquiries/InquiryStatusBadge";
import { Button } from "@/components/ui/button";
import type { Inquiry } from "@/types/inquiry";
import { getBuyerInitials } from "@/types/inquiry";

type InquiryTableProps = {
  inquiries: Inquiry[];
  onView: (inquiry: Inquiry, trigger?: HTMLElement) => void;
};

function formatSubmittedDate(dateString: string) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function BuyerAvatar({ name }: { name: string }) {
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700"
      aria-hidden="true"
    >
      {getBuyerInitials(name)}
    </span>
  );
}

export default function InquiryTable({ inquiries, onView }: InquiryTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-xl border bg-card shadow-sm md:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Buyer
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Company
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Product
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Country
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Submitted
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr
                key={inquiry.id}
                className="border-b last:border-b-0 transition-colors hover:bg-muted/20"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <BuyerAvatar name={inquiry.buyer_name} />
                    <span className="font-medium text-foreground">
                      {inquiry.buyer_name || "—"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {inquiry.buyer_company || "—"}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {inquiry.product_name || "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {inquiry.buyer_country || "—"}
                </td>
                <td className="px-4 py-3">
                  <InquiryStatusBadge status={inquiry.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatSubmittedDate(inquiry.created_at)}
                </td>
                <td className="px-4 py-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(event) => onView(inquiry, event.currentTarget)}
                  >
                    <Eye className="size-3.5" />
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { formatSubmittedDate, BuyerAvatar };
