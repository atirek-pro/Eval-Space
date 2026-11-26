import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Eval Space",
  robots: { index: false, follow: false },
};

// Every /dashboard page shares the sidebar; AppShell also keeps signed-out people out.
export default function DashboardLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
