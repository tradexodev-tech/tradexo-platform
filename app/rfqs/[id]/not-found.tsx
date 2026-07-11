import Link from "next/link";

import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";

export default function PublicRFQNotFound() {
  return (
    <>
      <Navbar />
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">RFQ not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This RFQ may be private, closed, or no longer available.
        </p>
        <Button asChild className="mt-6">
          <Link href="/rfqs">Back to RFQ Marketplace</Link>
        </Button>
      </div>
    </>
  );
}
