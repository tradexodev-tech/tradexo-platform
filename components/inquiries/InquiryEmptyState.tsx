import Link from "next/link";
import { Store } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function InquiryEmptyState() {
  return (
    <div className="flex flex-col items-center rounded-xl border bg-card px-6 py-16 text-center shadow-sm">
      <span className="text-5xl leading-none" role="img" aria-label="Inbox">
        📬
      </span>
      <h3 className="mt-6 text-lg font-semibold text-foreground">
        No inquiries yet
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Buyer inquiries from your marketplace listings will appear here once
        received.
      </p>
      <Button asChild className="mt-6">
        <Link href="/marketplace">
          <Store className="size-4" />
          Browse Marketplace
        </Link>
      </Button>
    </div>
  );
}
