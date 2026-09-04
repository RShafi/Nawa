import { createClient } from "@/utils/supabase/server";
import { NavShell } from "@/components/layout/NavShell";

export async function AppChrome({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <NavShell email={user?.email ?? null}>{children}</NavShell>;
}
