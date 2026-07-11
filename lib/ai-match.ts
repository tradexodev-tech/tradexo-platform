import {
  AI_MATCH_CONFIDENCE_THRESHOLDS,
  AI_MATCH_MAX_SCORE,
  AI_MATCH_WEIGHTS,
  type AIMatchBuyerProfile,
  type AIMatchConfidence,
  type AIMatchResult,
  type AIMatchScoreBreakdown,
  type AIMatchSupplierProfile,
} from "@/types/ai-match";

/**
 * AI Match Score Engine
 *
 * Pure, deterministic scoring utilities for buyer-supplier compatibility.
 * No React, Supabase, UI, or database access.
 *
 * ---------------------------------------------------------------------------
 * UNIT-TESTABLE EXAMPLES
 * ---------------------------------------------------------------------------
 *
 * Example A — High-confidence perfect match (score: 100, confidence: High)
 *
 *   const buyer: AIMatchBuyerProfile = {
 *     industry: "Additive Manufacturing",
 *     country: "United States",
 *     interestedCategories: ["Industrial Machinery"],
 *     supplierPreference: "Manufacturer",
 *     searchKeywords: ["3D Printing", "CNC"],
 *   };
 *
 *   const supplier: AIMatchSupplierProfile = {
 *     industry: "Additive Manufacturing",
 *     country: "United States",
 *     supplierType: "Manufacturer",
 *     companyProfile: {
 *       company_name: "Precision Parts Co.",
 *       about_company: "3D printing and CNC machining for aerospace clients.",
 *       business_type: "B2B Manufacturer",
 *     },
 *     publishedProducts: [
 *       {
 *         product_name: "Industrial 3D Printer",
 *         product_category: "Industrial Machinery",
 *         short_description: "Production-grade 3D printing system",
 *         full_description: "Supports CNC workflows and rapid prototyping.",
 *         meta_keywords: "3D Printing, CNC, aerospace",
 *       },
 *     ],
 *     productCategories: ["Industrial Machinery"],
 *   };
 *
 *   calculateAIMatch(buyer, supplier);
 *   // => {
 *   //   score: 100,
 *   //   confidence: "High",
 *   //   reasons: [
 *   //     "✓ Same industry",
 *   //     "✓ Same product category",
 *   //     "✓ Supplier located in preferred country",
 *   //     "✓ Matching supplier type",
 *   //     "✓ Matching keywords: \"3D Printing\", \"CNC\"",
 *   //   ],
 *   // }
 *
 * Example B — Partial match (score: 40, confidence: Medium)
 *
 *   const buyer: AIMatchBuyerProfile = {
 *     industry: "Textiles & Apparel",
 *     country: "Germany",
 *     interestedCategories: ["Textiles & Apparel"],
 *     supplierPreference: "Exporter",
 *     searchKeywords: ["organic cotton", "sustainable"],
 *   };
 *
 *   const supplier: AIMatchSupplierProfile = {
 *     industry: "Food & Beverage",
 *     country: "India",
 *     supplierType: "Manufacturer",
 *     companyProfile: {
 *       company_name: "GreenTex Mills",
 *       about_company: "Organic cotton fabrics for export markets.",
 *       business_type: "Exporter",
 *     },
 *     publishedProducts: [
 *       {
 *         product_name: "Organic Cotton Fabric",
 *         product_category: "Textiles & Apparel",
 *         short_description: "Sustainable woven cotton",
 *         full_description: "Certified organic cotton rolls.",
 *         meta_keywords: "organic cotton, sustainable",
 *       },
 *     ],
 *     productCategories: ["Textiles & Apparel"],
 *   };
 *
 *   calculateAIMatch(buyer, supplier);
 *   // => {
 *   //   score: 40,
 *   //   confidence: "Medium",
 *   //   reasons: [
 *   //     "✓ Same product category",
 *   //     "✓ Matching keywords: \"organic cotton\", \"sustainable\"",
 *   //   ],
 *   // }
 *   // Breakdown: category 30 + keywords 10 + industry 0 + country 0 + type 0
 *
 * Example C — Low confidence, no overlap (score: 0, confidence: Low)
 *
 *   const buyer: AIMatchBuyerProfile = {
 *     industry: "Pharmaceuticals & Biotech",
 *     country: "Japan",
 *     interestedCategories: ["Pharmaceuticals"],
 *     supplierPreference: "Importer",
 *     searchKeywords: ["API", "GMP"],
 *   };
 *
 *   const supplier: AIMatchSupplierProfile = {
 *     industry: "Construction & Building Materials",
 *     country: "UAE",
 *     supplierType: "Service Provider",
 *     companyProfile: {
 *       company_name: "Desert Build LLC",
 *       about_company: "Commercial construction services.",
 *       business_type: "Contractor",
 *     },
 *     publishedProducts: [],
 *     productCategories: ["Packaging Materials"],
 *   };
 *
 *   calculateAIMatch(buyer, supplier);
 *   // => { score: 0, confidence: "Low", reasons: [] }
 *
 *   // Country-only match variant (score: 15, confidence: Low):
 *   // Set supplier.country to "Japan" while keeping all other fields different.
 *   // => { score: 15, confidence: "Low", reasons: ["✓ Supplier located in preferred country"] }
 *
 * Example D — Keyword partial credit (score: 37, confidence: Low)
 *
 *   normalizeKeywords([" 3D Printing ", "CNC", "", "cnc", "3d printing"]);
 *   // => ["3d printing", "cnc"]
 *
 *   calculateKeywordScore(
 *     ["3D Printing", "CNC", "Laser Cutting"],
 *     "We offer 3D printing services for prototypes."
 *   );
 *   // => 7
 *   // 2 of 3 buyer keywords found => round((2 / 3) * 10) = 7
 *
 * Example E — Confidence boundaries
 *
 *   calculateConfidence(39); // => "Low"
 *   calculateConfidence(40); // => "Medium"
 *   calculateConfidence(69); // => "Medium"
 *   calculateConfidence(70); // => "High"
 *   calculateConfidence(100); // => "High"
 */

function normalizeComparableValue(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function normalizeKeywords(keywords: string[]) {
  const seen = new Set<string>();

  return keywords
    .map((keyword) => normalizeComparableValue(keyword))
    .filter((keyword) => {
      if (!keyword || seen.has(keyword)) {
        return false;
      }

      seen.add(keyword);
      return true;
    });
}

function getSupplierCategories(supplier: AIMatchSupplierProfile) {
  const categories = new Set<string>();

  for (const category of supplier.productCategories) {
    const normalized = normalizeComparableValue(category);
    if (normalized) {
      categories.add(normalized);
    }
  }

  for (const product of supplier.publishedProducts) {
    const normalized = normalizeComparableValue(product.product_category);
    if (normalized) {
      categories.add(normalized);
    }
  }

  return categories;
}

function buildSupplierKeywordCorpus(supplier: AIMatchSupplierProfile) {
  const chunks = [
    supplier.companyProfile.company_name,
    supplier.companyProfile.about_company,
    supplier.companyProfile.business_type,
    supplier.industry,
    supplier.country,
    supplier.supplierType,
    ...supplier.productCategories,
  ];

  for (const product of supplier.publishedProducts) {
    chunks.push(
      product.product_name,
      product.product_category,
      product.short_description,
      product.full_description,
      product.meta_keywords
    );
  }

  return normalizeComparableValue(chunks.filter(Boolean).join(" "));
}

export function calculateKeywordScore(
  buyerKeywords: string[],
  supplierCorpus: string
) {
  const normalizedKeywords = normalizeKeywords(buyerKeywords);

  if (normalizedKeywords.length === 0) {
    return 0;
  }

  const normalizedCorpus = normalizeComparableValue(supplierCorpus);
  const matchedKeywords = normalizedKeywords.filter((keyword) =>
    normalizedCorpus.includes(keyword)
  );

  return Math.round(
    (matchedKeywords.length / normalizedKeywords.length) *
      AI_MATCH_WEIGHTS.keywords
  );
}

function scoreIndustryMatch(
  buyer: AIMatchBuyerProfile,
  supplier: AIMatchSupplierProfile
) {
  const buyerIndustry = normalizeComparableValue(buyer.industry);
  const supplierIndustry = normalizeComparableValue(supplier.industry);

  if (!buyerIndustry || !supplierIndustry || buyerIndustry !== supplierIndustry) {
    return 0;
  }

  return AI_MATCH_WEIGHTS.industry;
}

function scoreCategoryMatch(
  buyer: AIMatchBuyerProfile,
  supplier: AIMatchSupplierProfile
) {
  const buyerCategories = buyer.interestedCategories
    .map((category) => normalizeComparableValue(category))
    .filter(Boolean);

  if (buyerCategories.length === 0) {
    return 0;
  }

  const supplierCategories = getSupplierCategories(supplier);

  return buyerCategories.some((category) => supplierCategories.has(category))
    ? AI_MATCH_WEIGHTS.category
    : 0;
}

function scoreCountryMatch(
  buyer: AIMatchBuyerProfile,
  supplier: AIMatchSupplierProfile
) {
  const buyerCountry = normalizeComparableValue(buyer.country);
  const supplierCountry = normalizeComparableValue(supplier.country);

  if (!buyerCountry || !supplierCountry || buyerCountry !== supplierCountry) {
    return 0;
  }

  return AI_MATCH_WEIGHTS.country;
}

function scoreSupplierTypeMatch(
  buyer: AIMatchBuyerProfile,
  supplier: AIMatchSupplierProfile
) {
  const buyerPreference = normalizeComparableValue(buyer.supplierPreference);
  const supplierType = normalizeComparableValue(supplier.supplierType);

  if (!buyerPreference || !supplierType || buyerPreference !== supplierType) {
    return 0;
  }

  return AI_MATCH_WEIGHTS.supplierType;
}

function getMatchedKeywords(
  buyer: AIMatchBuyerProfile,
  supplier: AIMatchSupplierProfile
) {
  const normalizedKeywords = normalizeKeywords(buyer.searchKeywords);

  if (normalizedKeywords.length === 0) {
    return [];
  }

  const corpus = buildSupplierKeywordCorpus(supplier);

  return normalizedKeywords.filter((keyword) => corpus.includes(keyword));
}

function getMatchedCategories(
  buyer: AIMatchBuyerProfile,
  supplier: AIMatchSupplierProfile
) {
  const buyerCategories = buyer.interestedCategories
    .map((category) => category.trim())
    .filter(Boolean);
  const supplierCategories = getSupplierCategories(supplier);

  return buyerCategories.filter((category) =>
    supplierCategories.has(normalizeComparableValue(category))
  );
}

export function calculateConfidence(score: number): AIMatchConfidence {
  const clampedScore = Math.min(
    AI_MATCH_MAX_SCORE,
    Math.max(0, Math.round(score))
  );

  if (clampedScore <= AI_MATCH_CONFIDENCE_THRESHOLDS.lowMax) {
    return "Low";
  }

  if (clampedScore <= AI_MATCH_CONFIDENCE_THRESHOLDS.mediumMax) {
    return "Medium";
  }

  return "High";
}

export function buildMatchReasons(
  buyer: AIMatchBuyerProfile,
  supplier: AIMatchSupplierProfile,
  breakdown: AIMatchScoreBreakdown
) {
  const reasons: string[] = [];

  if (breakdown.industry > 0) {
    reasons.push("✓ Same industry");
  }

  if (breakdown.category > 0) {
    const matchedCategories = getMatchedCategories(buyer, supplier);

    if (matchedCategories.length === 1) {
      reasons.push("✓ Same product category");
    } else if (matchedCategories.length > 1) {
      reasons.push(
        `✓ Matching product categories: ${matchedCategories
          .map((category) => `"${category}"`)
          .join(", ")}`
      );
    } else {
      reasons.push("✓ Same product category");
    }
  }

  if (breakdown.country > 0) {
    reasons.push("✓ Supplier located in preferred country");
  }

  if (breakdown.supplierType > 0) {
    reasons.push("✓ Matching supplier type");
  }

  if (breakdown.keywords > 0) {
    const matchedKeywords = getMatchedKeywords(buyer, supplier);

    if (matchedKeywords.length > 0) {
      const displayKeywords = matchedKeywords.map((keyword) => {
        const original = buyer.searchKeywords.find(
          (value) => normalizeComparableValue(value) === keyword
        );

        return original?.trim() || keyword;
      });

      reasons.push(
        `✓ Matching keywords: ${displayKeywords
          .map((keyword) => `"${keyword}"`)
          .join(", ")}`
      );
    }
  }

  return reasons;
}

export function calculateAIMatchScoreBreakdown(
  buyer: AIMatchBuyerProfile,
  supplier: AIMatchSupplierProfile
): AIMatchScoreBreakdown {
  const industry = scoreIndustryMatch(buyer, supplier);
  const category = scoreCategoryMatch(buyer, supplier);
  const country = scoreCountryMatch(buyer, supplier);
  const supplierType = scoreSupplierTypeMatch(buyer, supplier);
  const keywords = calculateKeywordScore(
    buyer.searchKeywords,
    buildSupplierKeywordCorpus(supplier)
  );

  return {
    industry,
    category,
    country,
    supplierType,
    keywords,
  };
}

export function calculateAIMatch(
  buyer: AIMatchBuyerProfile,
  supplier: AIMatchSupplierProfile
): AIMatchResult {
  const breakdown = calculateAIMatchScoreBreakdown(buyer, supplier);
  const rawScore =
    breakdown.industry +
    breakdown.category +
    breakdown.country +
    breakdown.supplierType +
    breakdown.keywords;
  const score = Math.min(AI_MATCH_MAX_SCORE, Math.max(0, rawScore));

  return {
    score,
    confidence: calculateConfidence(score),
    reasons: buildMatchReasons(buyer, supplier, breakdown),
  };
}
