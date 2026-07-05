"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfile } from "@/lib/auth";

export default function CompleteProfilePage() {

  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("India");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");

  async function handleContinue() {
    const { error } = await saveProfile({
      full_name: fullName,
      company_name: companyName,
      phone,
      country,
      city,
      website,
      linkedin,
    });

  if (error) {
  console.error("Save Profile Error:", error);
  alert(error.message);
  return;
}

console.log("Profile saved successfully");
alert("Profile Saved Successfully!");

router.push("/role-selection");
}  
return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-10">

        {/* Progress Bar */}
        <div className="mb-6">
          <span className="text-sm font-semibold text-blue-600">
            Step 1 of 3
          </span>

          <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
            <div className="w-1/3 h-2 bg-blue-600 rounded-full"></div>
          </div>
        </div>

        <h1 className="text-4xl font-bold">
          Complete Your Profile
        </h1>

        <p className="text-gray-600 mt-2 mb-10">
          Tell us about yourself and your business.
        </p>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

  <div>
    <label className="block text-sm font-medium mb-2">
      Full Name
    </label>

    <input
  type="text"
  placeholder="John Smith"
  className="w-full border rounded-lg p-3"
  value={fullName}
  onChange={(e) => setFullName(e.target.value)}
/>
  </div>

  <div>
    <label className="block text-sm font-medium mb-2">
      Company Name
    </label>

    <input
  type="text"
  placeholder="ABC Industries"
  className="w-full border rounded-lg p-3"
  value={companyName}
  onChange={(e) => setCompanyName(e.target.value)}
/>
  </div>

  <div>
    <label className="block text-sm font-medium mb-2">
      Country
    </label>

    <select
  className="w-full border rounded-lg p-3"
  value={country}
  onChange={(e) => setCountry(e.target.value)}
>
      <option>India</option>
      <option>United States</option>
      <option>Japan</option>
      <option>Germany</option>
      <option>United Kingdom</option>
      <option>UAE</option>
    </select>
  </div>

  <div>
    <label className="block text-sm font-medium mb-2">
      City
    </label>

    <input
  type="text"
  placeholder="Mumbai"
  className="w-full border rounded-lg p-3"
  value={city}
  onChange={(e) => setCity(e.target.value)}
/>
  </div>

  <div>
    <label className="block text-sm font-medium mb-2">
      Phone Number
    </label>

    <input
  type="tel"
  placeholder="+91 9876543210"
  className="w-full border rounded-lg p-3"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
/>
  </div>

  <div>
    <label className="block text-sm font-medium mb-2">
      Website
    </label>

    <input
  type="url"
  placeholder="https://company.com"
  className="w-full border rounded-lg p-3"
  value={website}
  onChange={(e) => setWebsite(e.target.value)}
/>
  </div>

</div>

<button
  onClick={handleContinue}
  className="mt-10 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
>
  Continue to Role Selection →
</button>
        {/* Form fields will go here */}

      </div>
    </div>
  );
}