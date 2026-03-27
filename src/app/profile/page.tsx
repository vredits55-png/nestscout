import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ClientProfile from "./ClientProfile";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return <ClientProfile initialProfile={profile} userEmail={user.email || ""} />;
}
