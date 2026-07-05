"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getProfile } from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const { error } = await signIn(email, password);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login Successful!");

    const { data: profile, error: profileError } = await getProfile();

    if (profileError || !profile?.full_name) {
      router.push("/complete-profile");
      return;
    }

    if (!profile.role) {
      router.push("/role-selection");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

        <h1 className="mb-6 text-3xl font-bold">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="mb-4 w-full rounded-lg border p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-6 w-full rounded-lg border p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full rounded-lg bg-blue-600 p-3 text-white"
        >
          Login
        </button>

      </div>
    </main>
  );
}