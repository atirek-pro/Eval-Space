import Navbar from "@/components/Navbar";
import AuthScreen from "@/components/AuthScreen";

export const metadata = {
  title: "Sign in · Eval Space",
  description: "Sign in to Eval Space with Google, GitHub or your email.",
};

export default function SignIn() {
  return (
    <>
      <Navbar base="/" login={false} cta={null} />
      <main id="top">
        <AuthScreen mode="signin" />
      </main>
    </>
  );
}
