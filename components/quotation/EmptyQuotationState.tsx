import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EmptyQuotationState() {
  return (
    <div className="flex flex-col items-center rounded-xl border bg-card px-6 py-16 text-center shadow-sm">
      <div className="flex size-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <FileText className="size-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        No quotations yet
      </h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Browse the RFQ Marketplace and submit quotations for open buyer
        requests.
      </p>
      <Button asChild className="mt-6">
        <Link href="/rfqs">Browse RFQ Marketplace</Link>
      </Button>
    </div>
  );
}
