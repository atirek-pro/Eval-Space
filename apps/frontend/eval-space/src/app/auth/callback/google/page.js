import Navbar from "@/components/Navbar";
import SsoCallback from "@/components/SsoCallback";

export const metadata = {
  title: "Signing in with Google · Eval Space",
  robots: { index: false, follow: false },
};

export default function GoogleCallback() {
  return (
    <>
      <Navbar base="/" login={false} cta={null} />
      <main id="top">
        <SsoCallback provider="google" />
      </main>
    </>
  );
}
