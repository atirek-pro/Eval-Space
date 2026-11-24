import Navbar from "@/components/Navbar";
import AuthScreen from "@/components/AuthScreen";

export const metadata = {
  title: "Create an account · Eval Space",
  description: "Create an Eval Space account with Google, GitHub or your email.",
};

export default function SignUp() {
  return (
    <>
      <Navbar base="/" cta={["/signin", "Sign in"]} />
      <main id="top">
        <AuthScreen mode="signup" />
      </main>
    </>
  );
}
