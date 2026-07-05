import Link from "next/link";
import { Building2 } from "lucide-react";

import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";

export default function PublicCompanyNotFound() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center bg-background px-4 py-20">
        <div className="max-w-md text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-muted">
            <Building2 className="size-8 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-foreground">Company not found</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The company profile you are looking for does not exist or is not publicly
            available.
          </p>
          <Button asChild className="mt-8">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
