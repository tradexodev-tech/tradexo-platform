"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveRole } from "@/lib/auth";

export default function RoleSelector() {
  const router = useRouter();

  const [role, setRole] = useState("");

  async function handleContinue() {
    if (!role) {
      alert("Please select a role.");
      return;
    }

    const { error } = await saveRole(role);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl">

        <h1 className="text-3xl font-bold mb-2">
          Select Your Role
        </h1>

        <p className="text-gray-600 mb-8">
          Choose how you want to use Tradexo.
        </p>

        <div className="space-y-4">

          <button
            onClick={() => setRole("Exporter")}
            className={`w-full border rounded-lg p-4 text-left ${
              role === "Exporter"
                ? "border-blue-600 bg-blue-50"
                : ""
            }`}
          >
            🌍 Exporter
          </button>

          <button
            onClick={() => setRole("Importer")}
            className={`w-full border rounded-lg p-4 text-left ${
              role === "Importer"
                ? "border-blue-600 bg-blue-50"
                : ""
            }`}
          >
            📦 Importer
          </button>

          <button
            onClick={() => setRole("Manufacturer")}
            className={`w-full border rounded-lg p-4 text-left ${
              role === "Manufacturer"
                ? "border-blue-600 bg-blue-50"
                : ""
            }`}
          >
            🏭 Manufacturer
          </button>

          <button
            onClick={() => setRole("Service Provider")}
            className={`w-full border rounded-lg p-4 text-left ${
              role === "Service Provider"
                ? "border-blue-600 bg-blue-50"
                : ""
            }`}
          >
            🤝 Service Provider
          </button>

        </div>

        <button
          onClick={handleContinue}
          className="mt-8 w-full bg-blue-600 text-white rounded-lg p-3"
        >
          Continue
        </button>

      </div>
    </div>
  );
}