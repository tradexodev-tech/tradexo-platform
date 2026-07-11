import Link from "next/link";

import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";

export default function EventNotFound() {
  return (
    <>
      <Navbar />
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">Event Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          This event may have been removed, is not yet published, or the link is incorrect.
        </p>
        <Button asChild className="mt-6">
          <Link href="/events">Browse Events</Link>
        </Button>
      </div>
    </>
  );
}
