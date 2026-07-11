import type { PublicCompanyProfile } from "@/types/company";
import type { Product } from "@/types/product";

export type AIMatchConfidence = "Low" | "Medium" | "High";

export type AIMatchResult = {
  score: number;
  confidence: AIMatchConfidence;
  reasons: string[];
};

export type AIMatchBuyerProfile = {
  industry: string;
  country: string;
  interestedCategories: string[];
  supplierPreference: string;
  searchKeywords: string[];
};

export type AIMatchSupplierCompanyProfile = Pick<
  PublicCompanyProfile,
  "company_name" | "about_company" | "business_type"
>;

export type AIMatchSupplierProduct = Pick<
  Product,
  | "product_name"
  | "product_category"
  | "short_description"
  | "full_description"
  | "meta_keywords"
>;

export type AIMatchSupplierProfile = {
  industry: string;
  country: string;
  supplierType: string;
  companyProfile: AIMatchSupplierCompanyProfile;
  publishedProducts: AIMatchSupplierProduct[];
  productCategories: string[];
};

export type AIMatchScoreBreakdown = {
  industry: number;
  category: number;
  country: number;
  supplierType: number;
  keywords: number;
};

export const AI_MATCH_WEIGHTS = {
  industry: 35,
  category: 30,
  country: 15,
  supplierType: 10,
  keywords: 10,
} as const;

export const AI_MATCH_CONFIDENCE_THRESHOLDS = {
  lowMax: 39,
  mediumMax: 69,
} as const;

export const AI_MATCH_MAX_SCORE = 100;
