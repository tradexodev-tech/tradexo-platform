import type { Metadata } from "next";

import Navbar from "@/components/landing/Navbar";
import RFQMarketplaceView from "@/components/rfq-marketplace/RFQMarketplaceView";

export const metadata: Metadata = {
  title: "RFQ Marketplace | Tradexo",
  description:
    "Discover open buyer requests for quotation from global importers on Tradexo.",
};

export default function PublicRFQsPage() {
  return (
    <>
      <Navbar />
      <RFQMarketplaceView />
    </>
  );
}
