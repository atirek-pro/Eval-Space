import Image from "next/image";
import Reveal from "@/components/Reveal";

const highlights = [
  "Built by engineers who ship AI to production",
  "Open, reproducible evaluation methodology",
  "Model- and vendor-agnostic by design",
];

export default function About() {
  return (
    <section
      id="about"
      className="relative mx-auto grid max-w-7xl scroll-mt-20 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20"
    >
      {/* Left: copy */}
      <Reveal direction="left">
        <span className="text-sm font-medium uppercase tracking-widest text-accent">
          About Us
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Making AI{" "}
          <span className="bg-gradient-to-r from-primary-soft to-accent bg-clip-text text-transparent">
            measurable
          </span>{" "}
          for every team
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Eval Space started with a simple frustration: every team was building
          its own scripts to test models, and nobody could compare results with
          confidence. We set out to build one place where models, agents and
          evaluation harnesses can be tested the same way, every time.
        </p>
        <p className="mt-4 leading-relaxed text-muted">
          Today we help researchers and product teams move from &ldquo;it seems
          better&rdquo; to hard evidence — so they can ship AI that is reliable,
          safe and genuinely useful.
        </p>

        <ul className="mt-8 space-y-3">
          {highlights.map((item) => (
            <li key={item} className="flex items-center gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="m5 12 5 5L20 7" />
                </svg>
              </span>
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      {/* Right: image (placeholder — swap the src later) */}
      <Reveal direction="right" delay={150} className="relative">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/30 blur-lg" />
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
          <Image
            src="https://picsum.photos/seed/evalspace-about/1200/900"
            alt="The Eval Space team at work"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
      </Reveal>
    </section>
  );
}
