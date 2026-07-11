import { calculateCompanyProfileCompletion } from "@/lib/company-profile-completion";
import type { RecommendedBuyer } from "@/lib/recommended-buyers";
import type { AIMatchSupplierProduct, AIMatchSupplierProfile } from "@/types/ai-match";
import type { PublicCompanyProfile } from "@/types/company";

export const AI_DASHBOARD_SUGGESTION_LIMIT = 5;

export type AIDashboardConfidenceCounts = {
  high: number;
  medium: number;
  low: number;
};

export type AIDashboardMatchSummary = {
  totalRecommendedBuyers: number;
  averageMatchScore: number;
  highestMatchScore: number;
  confidenceCounts: AIDashboardConfidenceCounts;
};

export type AIDashboardInsights = {
  summary: AIDashboardMatchSummary;
  suggestions: string[];
  hasRecommendations: boolean;
};

export type AIDashboardSuggestionInput = {
  companyProfile: PublicCompanyProfile;
  publishedProducts: AIMatchSupplierProduct[];
  supplierMatchProfile: AIMatchSupplierProfile;
};

export function calculateAIDashboardMatchSummary(
  buyers: RecommendedBuyer[]
): AIDashboardMatchSummary {
  if (buyers.length === 0) {
    return {
      totalRecommendedBuyers: 0,
      averageMatchScore: 0,
      highestMatchScore: 0,
      confidenceCounts: {
        high: 0,
        medium: 0,
        low: 0,
      },
    };
  }

  const totalScore = buyers.reduce((sum, buyer) => sum + buyer.match.score, 0);
  const confidenceCounts = buyers.reduce<AIDashboardConfidenceCounts>(
    (counts, buyer) => {
      if (buyer.match.confidence === "High") {
        counts.high += 1;
      } else if (buyer.match.confidence === "Medium") {
        counts.medium += 1;
      } else {
        counts.low += 1;
      }

      return counts;
    },
    { high: 0, medium: 0, low: 0 }
  );

  return {
    totalRecommendedBuyers: buyers.length,
    averageMatchScore: Math.round(totalScore / buyers.length),
    highestMatchScore: Math.max(...buyers.map((buyer) => buyer.match.score)),
    confidenceCounts,
  };
}

function hasWeakProductDescriptions(products: AIMatchSupplierProduct[]) {
  return products.some((product) => {
    const shortDescription = product.short_description.trim();
    const fullDescription = product.full_description.trim();

    return shortDescription.length < 40 || fullDescription.length < 80;
  });
}

function hasSparseProductKeywords(products: AIMatchSupplierProduct[]) {
  return (
    products.length === 0 ||
    products.every((product) => !product.meta_keywords.trim())
  );
}

export function generateAIDashboardSuggestions(
  input: AIDashboardSuggestionInput,
  limit = AI_DASHBOARD_SUGGESTION_LIMIT
) {
  const suggestions: string[] = [];
  const profileCompletion = calculateCompanyProfileCompletion(
    input.companyProfile
  );
  const publishedProductCount = input.publishedProducts.length;
  const categoryCount = input.supplierMatchProfile.productCategories.length;
  const aboutCompany = input.companyProfile.about_company.trim();

  if (profileCompletion < 100) {
    suggestions.push("Complete your company profile");
  }

  if (!input.companyProfile.company_logo) {
    suggestions.push("Add company logo");
  }

  if (publishedProductCount === 0) {
    suggestions.push("Add more published products");
  } else if (publishedProductCount < 3) {
    suggestions.push("Add more published products");
  }

  if (categoryCount < 2) {
    suggestions.push("Add more product categories");
  }

  if (hasWeakProductDescriptions(input.publishedProducts)) {
    suggestions.push("Improve product descriptions");
  }

  if (aboutCompany.length < 80 || hasSparseProductKeywords(input.publishedProducts)) {
    suggestions.push("Add company keywords");
  }

  return [...new Set(suggestions)].slice(0, limit);
}

export function buildAIDashboardInsights(
  buyers: RecommendedBuyer[],
  suggestionInput: AIDashboardSuggestionInput
): AIDashboardInsights {
  const summary = calculateAIDashboardMatchSummary(buyers);

  return {
    summary,
    suggestions: generateAIDashboardSuggestions(suggestionInput),
    hasRecommendations: buyers.length > 0,
  };
}
