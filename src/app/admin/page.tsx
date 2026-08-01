import type { Route } from "next";
import { redirect } from "next/navigation";

import { isAdminAccessConfigured } from "@/auth/config";

export default function AdminPage() {
  if (!isAdminAccessConfigured()) return null;

  redirect("/admin/posts" as Route);
}
