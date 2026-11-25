import Navbar from "@/components/Navbar";
import SsoCallback from "@/components/SsoCallback";

export const metadata = {
  title: "Signing in with GitHub · Eval Space",
  robots: { index: false, follow: false },
};

export default function GitHubCallback() {
  return (
    <>
      <Navbar base="/" login={false} cta={null} />
      <main id="top">
        <SsoCallback provider="github" />
      </main>
    </>
  );
}
