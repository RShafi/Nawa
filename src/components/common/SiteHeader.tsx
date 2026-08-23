import { createClient } from "@/utils/supabase/server";
import { Navbar } from "@/components/layout/Navbar";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <Navbar email={user?.email ?? null} />;
}
