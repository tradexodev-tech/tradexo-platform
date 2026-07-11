"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AIInsightsWidget from "@/components/dashboard/AIInsightsWidget";
import DashboardAnalytics from "@/components/dashboard/DashboardAnalytics";
import ProfileSummaryCard from "@/components/dashboard/ProfileSummaryCard";
import RecommendedBuyers from "@/components/dashboard/RecommendedBuyers";
import { buildAIDashboardInsights, type AIDashboardInsights, type AIDashboardSuggestionInput } from "@/lib/ai-dashboard";
import { getProfile, getUser } from "@/lib/auth";
import {
  fetchRecommendedBuyers,
  isSupplierRole,
  type RecommendedBuyersFetchResult,
  type RecommendedBuyersSupplierProfile,
} from "@/lib/recommended-buyers";
import type { PublicCompanyProfile } from "@/types/company";

type Profile = PublicCompanyProfile & {
  full_name: string | null;
  role: string | null;
};

function mapProfileToCompanyProfile(profile: Profile): PublicCompanyProfile {
  return {
    id: profile.id,
    company_slug: profile.company_slug ?? "",
    company_logo: profile.company_logo ?? null,
    company_name: profile.company_name ?? "",
    about_company: profile.about_company ?? "",
    industry: profile.industry ?? "",
    business_type: profile.business_type ?? "",
    year_established: profile.year_established ?? null,
    number_of_employees: profile.number_of_employees ?? "",
    address: profile.address ?? "",
    country: profile.country ?? "",
    city: profile.city ?? "",
    website: profile.website ?? "",
    linkedin: profile.linkedin ?? "",
    certifications: profile.certifications ?? [],
    export_markets: profile.export_markets ?? [],
    import_markets: profile.import_markets ?? [],
  };
}

function buildSupplierProfile(profile: Profile): RecommendedBuyersSupplierProfile {
  return {
    id: profile.id,
    industry: profile.industry,
    country: profile.country,
    role: profile.role,
    company_name: profile.company_name,
    about_company: profile.about_company,
    business_type: profile.business_type,
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendationData, setRecommendationData] =
    useState<RecommendedBuyersFetchResult | null>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(
    null
  );
  const [insights, setInsights] = useState<AIDashboardInsights | null>(null);

  const supplierProfile = useMemo(
    () => (profile ? buildSupplierProfile(profile) : null),
    [profile]
  );

  const supplierImprovement = useMemo<AIDashboardSuggestionInput | null>(() => {
    if (!profile || !recommendationData) {
      return null;
    }

    return {
      companyProfile: mapProfileToCompanyProfile(profile),
      publishedProducts: recommendationData.publishedProducts,
      supplierMatchProfile: recommendationData.supplierMatchProfile,
    };
  }, [profile, recommendationData]);

  useEffect(() => {
    async function loadProfile() {
      const { data: authData } = await getUser();

      if (!authData.user) {
        router.push("/login");
        return;
      }

      const { data, error } = await getProfile();

      if (error || !data?.full_name) {
        router.push("/complete-profile");
        return;
      }

      if (!data.role) {
        router.push("/role-selection");
        return;
      }

      setProfile(data as Profile);
      setLoading(false);
    }

    void loadProfile();
  }, [router]);

  useEffect(() => {
    if (!profile || !supplierProfile || !isSupplierRole(profile.role)) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setRecommendationsLoading(true);
      setRecommendationsError(null);

      const { data, error } = await fetchRecommendedBuyers(supplierProfile);

      if (cancelled) {
        return;
      }

      if (error) {
        setRecommendationsError(
          error.message ?? "Failed to load buyer recommendations."
        );
        setRecommendationData(null);
        setInsights(
          buildAIDashboardInsights([], {
            companyProfile: mapProfileToCompanyProfile(profile),
            publishedProducts: [],
            supplierMatchProfile: {
              industry: profile.industry ?? "",
              country: profile.country ?? "",
              supplierType: profile.role ?? "",
              companyProfile: {
                company_name: profile.company_name ?? "",
                about_company: profile.about_company ?? "",
                business_type: profile.business_type ?? "",
              },
              publishedProducts: [],
              productCategories: [],
            },
          })
        );
        setRecommendationsLoading(false);
        return;
      }

      const result = data ?? {
        buyers: [],
        publishedProducts: [],
        supplierMatchProfile: {
          industry: "",
          country: "",
          supplierType: "",
          companyProfile: {
            company_name: "",
            about_company: "",
            business_type: "",
          },
          publishedProducts: [],
          productCategories: [],
        },
      };

      setRecommendationData(result);
      setInsights(
        buildAIDashboardInsights(result.buyers, {
          companyProfile: mapProfileToCompanyProfile(profile),
          publishedProducts: result.publishedProducts,
          supplierMatchProfile: result.supplierMatchProfile,
        })
      );
      setRecommendationsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [profile, supplierProfile]);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading overview...</p>
      </div>
    );
  }

  const showSupplierInsights = isSupplierRole(profile.role);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Welcome back, {profile.full_name}
        </h2>
        <p className="mt-1 text-muted-foreground">
          Here is an overview of your Tradexo workspace.
        </p>
      </div>

      <ProfileSummaryCard
        fullName={profile.full_name || ""}
        companyName={profile.company_name || ""}
        role={profile.role || ""}
        country={profile.country || ""}
      />

      {showSupplierInsights ? (
        <>
          <RecommendedBuyers
            supplierProfile={supplierProfile}
            supplierRole={profile.role}
            data={recommendationData}
            supplierImprovement={supplierImprovement}
            loading={recommendationsLoading}
            error={recommendationsError}
          />

          <AIInsightsWidget
            insights={insights}
            loading={recommendationsLoading}
          />
        </>
      ) : null}

      <DashboardAnalytics />
    </div>
  );
}
