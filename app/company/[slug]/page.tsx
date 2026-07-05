import { notFound } from "next/navigation";

import PublicCompanyProfileView from "@/components/company/PublicCompanyProfileView";
import Navbar from "@/components/landing/Navbar";
import {
  fetchCompanyBySlug,
  fetchPublishedProductsByCompanyId,
} from "@/lib/company";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { data: company } = await fetchCompanyBySlug(slug);

  if (!company) {
    return {
      title: "Company Not Found | Tradexo",
    };
  }

  return {
    title: `${company.company_name} | Tradexo`,
    description:
      company.about_company?.trim().slice(0, 160) ||
      `View ${company.company_name} on Tradexo.`,
  };
}

export default async function PublicCompanyPage({ params }: PageProps) {
  const { slug } = await params;
  const { data: company, error } = await fetchCompanyBySlug(slug);

  if (error || !company) {
    notFound();
  }

  const { data: products } = await fetchPublishedProductsByCompanyId(company.id);

  return (
    <>
      <Navbar />
      <PublicCompanyProfileView company={company} products={products ?? []} />
    </>
  );
}
