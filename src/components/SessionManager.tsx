"use client";

import { useParams } from "next/navigation";
import { useSessionTimeout } from "@/lib/hooks/useSessionTimeout";

export function SessionManager() {
  const params = useParams();
  const locale = (params.locale as string) || "es";

  useSessionTimeout(locale);

  return null;
}
