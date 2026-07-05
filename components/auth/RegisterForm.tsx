"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth";

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    const { error } = await signUp(email, password);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Registration Successful!");
    router.push("/login");
  }

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4">

      <h1 className="text-3xl font-bold">
        Create Account
      </h1>

      <input
        type="email"
        placeholder="Email"
        className="w-full border rounded-lg p-3"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full border rounded-lg p-3"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button
        onClick={handleRegister}
        className="w-full bg-blue-600 text-white rounded-lg p-3"
      >
        Register
      </button>

    </div>
  );
}