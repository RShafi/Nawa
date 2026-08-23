import { redirect } from "next/navigation";

/** Legacy singular route → V1 `/passports`. */
export default function PassportRedirectPage() {
  redirect("/passports");
}
