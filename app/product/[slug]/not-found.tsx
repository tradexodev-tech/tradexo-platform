import Link from "next/link";
import { Package } from "lucide-react";

import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";

export default function PublicProductNotFound() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center bg-background px-4 py-20">
        <div className="max-w-md text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-muted">
            <Package className="size-8 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-foreground">Product not found</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            This product does not exist, is not published, or is no longer available.
          </p>
          <Button asChild className="mt-8">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
