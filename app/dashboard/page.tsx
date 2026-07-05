"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import GettingStarted from "@/components/dashboard/GettingStarted";
import ProfileSummaryCard from "@/components/dashboard/ProfileSummaryCard";
import StatCard from "@/components/dashboard/StatCard";
import { getProfile, getUser } from "@/lib/auth";

type Profile = {
  full_name: string | null;
  company_name: string | null;
  role: string | null;
  country: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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

      setProfile(data);
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading overview...</p>
      </div>
    );
  }

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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="AI Match"
          value="0"
          description="Potential business matches"
          comingSoon
        />
        <StatCard
          title="Marketplace"
          value="0"
          description="Active listings"
          comingSoon
        />
        <StatCard
          title="Messages"
          value="0"
          description="Unread conversations"
          comingSoon
        />
        <StatCard
          title="Analytics"
          value="—"
          description="Performance insights"
          comingSoon
        />
      </div>

      <GettingStarted
        hasProfile={Boolean(profile.full_name)}
        hasRole={Boolean(profile.role)}
      />
    </div>
  );
}
