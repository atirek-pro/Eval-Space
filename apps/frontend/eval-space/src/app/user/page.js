import Navbar from "@/components/Navbar";
import UserProfile from "@/components/UserProfile";

export const metadata = {
  title: "Your account · Eval Space",
  robots: { index: false, follow: false },
};

export default function UserPage() {
  return (
    <>
      <Navbar base="/" cta={null} />
      <main id="top">
        <UserProfile />
      </main>
    </>
  );
}
