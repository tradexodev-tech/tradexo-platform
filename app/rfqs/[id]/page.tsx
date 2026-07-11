import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Navbar from "@/components/landing/Navbar";
import RFQDetail from "@/components/rfq-marketplace/RFQDetail";
import { fetchRFQById } from "@/lib/rfq";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: rfq } = await fetchRFQById(id);

  if (!rfq || rfq.status !== "open" || rfq.visibility !== "public") {
    return {
      title: "RFQ Not Found | Tradexo",
    };
  }

  return {
    title: `${rfq.title} | RFQ Marketplace | Tradexo`,
    description: rfq.description.slice(0, 160),
  };
}

export default async function PublicRFQDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { data: rfq, error } = await fetchRFQById(id);

  if (
    error ||
    !rfq ||
    rfq.status !== "open" ||
    rfq.visibility !== "public"
  ) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <RFQDetail rfq={rfq} />
    </>
  );
}
