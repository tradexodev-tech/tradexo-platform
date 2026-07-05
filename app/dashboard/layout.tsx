"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { getProfile, getUser, signOut } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const { data: authData } = await getUser();

      if (!authData.user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await getProfile();

      setFullName(profile?.full_name || "User");
      setCompanyName(profile?.company_name || "Company");
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          fullName={fullName}
          companyName={companyName}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
