import { notFound } from "next/navigation";
import type { Metadata } from "next";

import PublicProductView from "@/components/products/PublicProductView";
import Navbar from "@/components/landing/Navbar";
import { fetchCompanyByUserId } from "@/lib/company";
import {
  fetchPublishedProductBySlug,
  getProductSeoDescription,
  getProductSeoTitle,
} from "@/lib/product-public";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: product } = await fetchPublishedProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Tradexo",
    };
  }

  const title = getProductSeoTitle(product);
  const description = getProductSeoDescription(product);
  const keywords = product.meta_keywords?.trim();

  return {
    title: `${title} | Tradexo`,
    description,
    ...(keywords ? { keywords: keywords.split(",").map((k) => k.trim()) } : {}),
    openGraph: {
      title,
      description,
      type: "website",
      ...(product.product_images[0]?.url
        ? { images: [{ url: product.product_images[0].url, alt: product.product_name }] }
        : {}),
    },
  };
}

function ProductJsonLd({
  product,
  companyName,
}: {
  product: Awaited<ReturnType<typeof fetchPublishedProductBySlug>>["data"];
  companyName?: string;
}) {
  if (!product) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.product_name,
    description: getProductSeoDescription(product),
    image: product.product_images.map((image) => image.url),
    category: product.product_category,
    brand: product.brand_name
      ? { "@type": "Brand", name: product.brand_name }
      : undefined,
    sku: product.model_number || undefined,
    offers: product.price_on_request
      ? undefined
      : {
          "@type": "Offer",
          price: product.price,
          priceCurrency: product.currency,
          availability: "https://schema.org/InStock",
        },
    manufacturer: companyName
      ? { "@type": "Organization", name: companyName }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function PublicProductPage({ params }: PageProps) {
  const { slug } = await params;
  const { data: product, error } = await fetchPublishedProductBySlug(slug);

  if (error || !product) {
    notFound();
  }

  const { data: company } = await fetchCompanyByUserId(product.user_id);

  return (
    <>
      <ProductJsonLd product={product} companyName={company?.company_name} />
      <Navbar />
      <PublicProductView product={product} company={company} />
    </>
  );
}
