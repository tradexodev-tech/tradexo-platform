export const PRODUCT_CATEGORIES = [
  "Agriculture & Food",
  "Automotive Parts",
  "Chemicals",
  "Consumer Electronics",
  "Industrial Machinery",
  "Medical Devices",
  "Metals & Minerals",
  "Packaging Materials",
  "Pharmaceuticals",
  "Textiles & Apparel",
  "Other",
] as const;

export const PRODUCT_COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Germany",
  "Japan",
  "UAE",
  "China",
  "Singapore",
  "Australia",
  "Canada",
] as const;

export const COMPANY_INDUSTRIES = [
  "Agriculture & Agribusiness",
  "Aerospace & Defense",
  "Automotive & Vehicle Parts",
  "Chemicals & Petrochemicals",
  "Construction & Building Materials",
  "Consumer Electronics",
  "Electrical Equipment & Components",
  "Energy & Renewable Energy",
  "Environmental Services",
  "Fashion & Luxury Goods",
  "Food & Beverage",
  "Furniture & Home Goods",
  "Healthcare & Medical Devices",
  "Hospitality & Tourism Services",
  "Industrial Machinery",
  "Information Technology & Software",
  "Logistics & Freight Forwarding",
  "Metals & Steel",
  "Mining & Minerals",
  "Oil & Gas",
  "Packaging & Printing",
  "Pharmaceuticals & Biotech",
  "Plastics & Rubber",
  "Retail & Wholesale Trade",
  "Seafood & Fisheries",
  "Telecommunications",
  "Textiles & Apparel",
  "Tobacco & Alternatives",
  "Toys & Recreational Products",
  "Wood & Paper Products",
  "Other",
] as const;

export type MarketplaceSort = "newest" | "oldest" | "name";

export const MARKETPLACE_SORT_OPTIONS: { value: MarketplaceSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "A–Z" },
];
