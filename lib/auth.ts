import { supabase } from "./supabase";

export async function signUp(email: string, password: string) {
  return await supabase.auth.signUp({
    email,
    password,
  });
}

export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getUser() {
  return await supabase.auth.getUser();
}

export async function getProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: { message: "User not found" } };
  }

  return await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
}

export async function saveProfile(profile: {
  full_name: string;
  company_name: string;
  phone: string;
  country: string;
  city: string;
  website: string;
  linkedin: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: { message: "User not found" } };
  }

  return await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      ...profile,
    });
}

export async function saveRole(role: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: { message: "User not found" } };
  }

  return await supabase
    .from("profiles")
    .update({ role })
    .eq("id", user.id);
}