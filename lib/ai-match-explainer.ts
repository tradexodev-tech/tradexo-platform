import {
  generateAIDashboardSuggestions,
  type AIDashboardSuggestionInput,
} from "@/lib/ai-dashboard";
import {
  buildRecommendedSuppliersBuyerProfile,
  type RecommendedSuppliersBuyerContext,
} from "@/lib/recommended-suppliers";
import type {
  AIMatchBuyerProfile,
  AIMatchConfidence,
  AIMatchResult,
} from "@/types/ai-match";

export const AI_MATCH_EXPLANATION_SUGGESTION_LIMIT = 5;

export type AIMatchQualityTier = "excellent" | "good" | "potential" | "low";

export type AIMatchQuality = {
  tier: AIMatchQualityTier;
  label: string;
  minScore: number;
  maxScore: number;
};

export type AIMatchExplanationData = {
  score: number;
  confidence: AIMatchConfidence;
  quality: AIMatchQuality;
  reasons: string[];
  suggestions: string[];
};

export type AIMatchExplanationInput = {
  match: AIMatchResult;
  perspective: "supplier" | "buyer";
  supplierImprovement?: AIDashboardSuggestionInput;
  buyerImprovement?: RecommendedSuppliersBuyerContext | AIMatchBuyerProfile;
};

const EXPLANATION_REASON_PATTERNS: Array<{
  test: (reason: string) => boolean;
  label: string;
}> = [
  {
    test: (reason) => /same industry/i.test(reason),
    label: "✓ Same Industry",
  },
  {
    test: (reason) => /product categor/i.test(reason),
    label: "✓ Matching Product Category",
  },
  {
    test: (reason) => /preferred country/i.test(reason),
    label: "✓ Preferred Country",
  },
  {
    test: (reason) => /matching supplier type/i.test(reason),
    label: "✓ Matching Supplier Type",
  },
  {
    test: (reason) => /matching keywords/i.test(reason),
    label: "✓ Keyword Match",
  },
];

function reasonMatches(reasons: string[], pattern: RegExp) {
  return reasons.some((reason) => pattern.test(reason));
}

export function formatAIMatchExplanationReasons(
  reasons: string[],
  limit = EXPLANATION_REASON_PATTERNS.length
) {
  const formatted: string[] = [];

  for (const pattern of EXPLANATION_REASON_PATTERNS) {
    if (reasons.some(pattern.test)) {
      formatted.push(pattern.label);
    }

    if (formatted.length >= limit) {
      break;
    }
  }

  return formatted;
}

export function getAIMatchQuality(score: number): AIMatchQuality {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));

  if (normalizedScore >= 90) {
    return {
      tier: "excellent",
      label: "Excellent Match",
      minScore: 90,
      maxScore: 100,
    };
  }

  if (normalizedScore >= 70) {
    return {
      tier: "good",
      label: "Good Match",
      minScore: 70,
      maxScore: 89,
    };
  }

  if (normalizedScore >= 50) {
    return {
      tier: "potential",
      label: "Potential Match",
      minScore: 50,
      maxScore: 69,
    };
  }

  return {
    tier: "low",
    label: "Low Match",
    minScore: 0,
    maxScore: 49,
  };
}

export function getAIMatchQualityClassName(tier: AIMatchQualityTier) {
  switch (tier) {
    case "excellent":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "good":
      return "bg-blue-50 text-blue-700 ring-blue-600/20";
    case "potential":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    case "low":
    default:
      return "bg-slate-100 text-slate-700 ring-slate-600/20";
  }
}

export function getAIMatchConfidenceClassName(confidence: AIMatchConfidence) {
  switch (confidence) {
    case "High":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "Medium":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    case "Low":
    default:
      return "bg-slate-100 text-slate-700 ring-slate-600/20";
  }
}

function normalizeBuyerImprovementContext(
  context: RecommendedSuppliersBuyerContext | AIMatchBuyerProfile
): AIMatchBuyerProfile {
  return buildRecommendedSuppliersBuyerProfile(context);
}

function generateSupplierImprovementSuggestions(
  match: AIMatchResult,
  input: AIDashboardSuggestionInput,
  limit: number
) {
  const suggestions: string[] = [];
  const reasons = match.reasons;
  const dashboardSuggestions = generateAIDashboardSuggestions(input, limit);

  if (!reasonMatches(reasons, /product categor/i)) {
    suggestions.push("Add more product categories");
  }

  if (!reasonMatches(reasons, /preferred country/i)) {
    suggestions.push("Expand country coverage");
  }

  if (!reasonMatches(reasons, /matching keywords/i)) {
    suggestions.push("Add searchable keywords");
  }

  for (const suggestion of dashboardSuggestions) {
    if (suggestion === "Complete your company profile") {
      suggestions.push("Complete company profile");
    } else if (suggestion === "Add company logo") {
      suggestions.push("Upload company logo");
    } else if (suggestion === "Add more published products") {
      suggestions.push("Publish more products");
    } else if (suggestion === "Improve product descriptions") {
      suggestions.push("Improve product descriptions");
    } else if (suggestion === "Add company keywords") {
      suggestions.push("Add searchable keywords");
    } else {
      suggestions.push(suggestion);
    }
  }

  return [...new Set(suggestions)].slice(0, limit);
}

function generateBuyerImprovementSuggestions(
  match: AIMatchResult,
  buyer: AIMatchBuyerProfile,
  limit: number
) {
  const suggestions: string[] = [];
  const reasons = match.reasons;

  if (!buyer.industry.trim()) {
    suggestions.push("Complete company profile");
  }

  if (!reasonMatches(reasons, /product categor/i) || buyer.interestedCategories.length < 2) {
    suggestions.push("Add more product categories");
  }

  if (!reasonMatches(reasons, /preferred country/i) || !buyer.country.trim()) {
    suggestions.push("Expand country coverage");
  }

  if (!reasonMatches(reasons, /matching keywords/i) || buyer.searchKeywords.length === 0) {
    suggestions.push("Add searchable keywords");
  }

  if (
    !reasonMatches(reasons, /matching supplier type/i) &&
    !buyer.supplierPreference.trim()
  ) {
    suggestions.push("Set your preferred supplier type");
  }

  if (buyer.searchKeywords.length > 0 && !reasonMatches(reasons, /matching keywords/i)) {
    suggestions.push("Improve product descriptions");
  }

  return [...new Set(suggestions)].slice(0, limit);
}

export function generateAIMatchImprovementSuggestions(
  input: AIMatchExplanationInput,
  limit = AI_MATCH_EXPLANATION_SUGGESTION_LIMIT
) {
  if (input.perspective === "supplier" && input.supplierImprovement) {
    return generateSupplierImprovementSuggestions(
      input.match,
      input.supplierImprovement,
      limit
    );
  }

  if (input.perspective === "buyer" && input.buyerImprovement) {
    return generateBuyerImprovementSuggestions(
      input.match,
      normalizeBuyerImprovementContext(input.buyerImprovement),
      limit
    );
  }

  return [];
}

export function buildAIMatchExplanation(
  input: AIMatchExplanationInput
): AIMatchExplanationData {
  return {
    score: input.match.score,
    confidence: input.match.confidence,
    quality: getAIMatchQuality(input.match.score),
    reasons: formatAIMatchExplanationReasons(input.match.reasons),
    suggestions: generateAIMatchImprovementSuggestions(input),
  };
}
