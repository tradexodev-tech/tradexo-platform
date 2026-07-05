export type ProductStatus =
  | "draft"
  | "published"
  | "archived"
  | "pending_approval";

export type ProductImage = {
  url: string;
  order: number;
  uploaded_at: string;
};

export type ProductSpecification = {
  material: string;
  size_dimensions: string;
  weight: string;
  color: string;
  packaging: string;
  custom: Array<{ label: string; value: string }>;
};

export type ProductVariant = {
  id: string;
  variant_name: string;
  sku: string;
  price: number | null;
  moq: string;
  unit: string;
  stock_status: string;
};

export type Product = {
  id: string;
  user_id: string;
  company_id: string | null;
  product_name: string;
  product_category: string;
  short_description: string;
  full_description: string;
  hs_code: string;
  country_of_origin: string;
  brand_name: string;
  model_number: string;
  moq: string;
  production_capacity: string;
  unit: string;
  price_on_request: boolean;
  currency: string;
  price: number | null;
  lead_time: string;
  product_images: ProductImage[];
  product_video: string;
  certifications: string;
  specifications: ProductSpecification;
  variants: ProductVariant[];
  seo_title: string;
  seo_description: string;
  meta_keywords: string;
  slug: string;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
};

export type ProductFormInput = {
  product_name: string;
  product_category: string;
  short_description: string;
  full_description: string;
  hs_code: string;
  country_of_origin: string;
  brand_name: string;
  model_number: string;
  moq: string;
  production_capacity: string;
  unit: string;
  price_on_request: boolean;
  currency: string;
  price: number | null;
  lead_time: string;
  product_images: ProductImage[];
  product_video: string;
  certifications: string;
  specifications: ProductSpecification;
  variants: ProductVariant[];
  seo_title: string;
  seo_description: string;
  meta_keywords: string;
  slug: string;
};

export const emptyProductForm: ProductFormInput = {
  product_name: "",
  product_category: "",
  short_description: "",
  full_description: "",
  hs_code: "",
  country_of_origin: "India",
  brand_name: "",
  model_number: "",
  moq: "",
  production_capacity: "",
  unit: "",
  price_on_request: true,
  currency: "USD",
  price: null,
  lead_time: "",
  product_images: [],
  product_video: "",
  certifications: "",
  specifications: {
    material: "",
    size_dimensions: "",
    weight: "",
    color: "",
    packaging: "",
    custom: [],
  },
  variants: [],
  seo_title: "",
  seo_description: "",
  meta_keywords: "",
  slug: "",
};

export function productToFormInput(product: Product): ProductFormInput {
  return {
    product_name: product.product_name,
    product_category: product.product_category,
    short_description: product.short_description,
    full_description: product.full_description,
    hs_code: product.hs_code,
    country_of_origin: product.country_of_origin,
    brand_name: product.brand_name,
    model_number: product.model_number,
    moq: product.moq,
    production_capacity: product.production_capacity,
    unit: product.unit,
    price_on_request: product.price_on_request,
    currency: product.currency,
    price: product.price,
    lead_time: product.lead_time,
    product_images: product.product_images ?? [],
    product_video: product.product_video,
    certifications: product.certifications,
    specifications: product.specifications,
    variants: product.variants,
    seo_title: product.seo_title,
    seo_description: product.seo_description,
    meta_keywords: product.meta_keywords,
    slug: product.slug,
  };
}

export function parseProductImages(value: unknown): ProductImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is ProductImage =>
        typeof item === "object" &&
        item !== null &&
        "url" in item &&
        typeof (item as ProductImage).url === "string"
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function formInputToPreviewProduct(
  input: ProductFormInput,
  status: ProductStatus = "published"
): Product {
  return {
    id: "preview",
    user_id: "",
    company_id: null,
    ...input,
    status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
