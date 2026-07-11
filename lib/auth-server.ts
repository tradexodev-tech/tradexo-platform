import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getServerProfile() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: null };
  }

  return await supabase.from("profiles").select("*").eq("id", user.id).single();
}
