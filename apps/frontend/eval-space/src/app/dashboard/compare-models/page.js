import { redirect } from "next/navigation";

// Compare Models opens its first sub-section.
export default function CompareModelsPage() {
  redirect("/dashboard/compare-models/manual");
}
