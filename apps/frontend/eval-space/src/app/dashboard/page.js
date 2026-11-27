import { redirect } from "next/navigation";

// /dashboard opens the first feature.
export default function DashboardPage() {
  redirect("/dashboard/compare-models/manual");
}
