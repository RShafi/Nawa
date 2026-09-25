"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export type AuthActionState = {
  error?: string;
  message?: string;
};

const UNREACHABLE =
  "The Supabase project URL is missing or unreachable. Set NEXT_PUBLIC_SUPABASE_URL to your project and restart the dev server.";

function projectConfigError(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!url || !key) return UNREACHABLE;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return UNREACHABLE;
  } catch {
    return UNREACHABLE;
  }
  return null;
}

function authErrorMessage(error: { message?: string } | null): string {
  const message = error?.message?.trim() ?? "";
  const lower = message.toLowerCase();
  if (
    !message ||
    lower === "fetch failed" ||
    lower.includes("failed to fetch") ||
    lower.includes("enotfound") ||
    lower.includes("econnrefused") ||
    lower.includes("econnreset") ||
    lower.includes("getaddrinfo") ||
    lower.includes("network")
  ) {
    return UNREACHABLE;
  }
  return message;
}

export async function login(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/path");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const configError = projectConfigError();
  if (configError) return { error: configError };

  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: authErrorMessage(error) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    return { error: authErrorMessage({ message }) };
  }

  redirect(next.startsWith("/") ? next : "/path");
}

export async function signup(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const configError = projectConfigError();
  if (configError) return { error: configError };

  const supabase = await createClient();
  let data: Awaited<ReturnType<typeof supabase.auth.signUp>>["data"];
  try {
    const result = await supabase.auth.signUp({ email, password });
    if (result.error) return { error: authErrorMessage(result.error) };
    data = result.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    return { error: authErrorMessage({ message }) };
  }

  // Email confirmation enabled → no session yet
  if (!data.session) {
    return {
      message: "Check your email to confirm your account, then log in.",
    };
  }

  redirect("/path");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
