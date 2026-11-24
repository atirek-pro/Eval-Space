import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ScrollSpy from "@/components/ScrollSpy";

/*
  type: software
  flow: nav → hero → features → about → blog → contact → footer.
  deal: hero collage, footer-dark, rhythm space, buttons solid, mark ring, ground sand,
        palette lunar-grey-bronze, type funnel; effect painterly-landscape in the hero frame; card
        ground gradient-mesh (#features).
  moments: liquid-type (#about, the statement).
*/
export default function Home() {
  return (
    <>
      <Navbar />
      <main id="top">
        <Hero />
        <Features />
        <About />
        <Blog />
        <Contact />
      </main>
      <Footer />
      <ScrollSpy />
    </>
  );
}
