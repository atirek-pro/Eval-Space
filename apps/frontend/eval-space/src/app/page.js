import Link from "next/link";
import Navbar from "@/components/Navbar";
import Features from "@/components/Features";
import About from "@/components/About";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const sampleResults = [
  { name: "Model A · Agent Harness v2", score: 92, pass: true },
  { name: "Model B · Tool-Use Suite", score: 84, pass: true },
  { name: "Model C · RAG Benchmark", score: 71, pass: true },
  { name: "Model D · Safety Red-Team", score: 48, pass: false },
];

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="relative flex-1 overflow-hidden">
        {/* Background: grid + glow */}
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
        <div className="pointer-events-none absolute top-64 right-0 h-[360px] w-[360px] rounded-full bg-accent/15 blur-[110px]" />

        {/* Hero banner */}
        <section
          id="home"
          className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 pt-20 pb-12 lg:grid-cols-2 lg:pt-28 lg:pb-16"
        >
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-1.5 text-xs font-medium text-primary-soft">
              <span className="h-2 w-2 rounded-full bg-success" />
              AI Model &amp; Harness Evaluation Platform
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Measure what your{" "}
              <span className="bg-gradient-to-r from-primary-soft via-primary to-accent bg-clip-text text-transparent">
                AI really
              </span>{" "}
              can do.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Eval Space lets you benchmark LLMs, agents and evaluation
              harnesses side by side — run reproducible test suites, track
              regressions and ship models you can trust.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3 font-medium text-white shadow-lg shadow-primary/30 transition-opacity hover:opacity-90"
              >
                Start Evaluating Free
              </Link>
              <Link
                href="#features"
                className="rounded-full border border-border bg-surface/60 px-7 py-3 font-medium text-foreground transition-colors hover:border-primary-soft"
              >
                Explore Features
              </Link>
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
              {[
                ["50+", "Benchmarks"],
                ["10x", "Faster evals"],
                ["100%", "Reproducible"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-2xl font-semibold">{value}</dt>
                  <dd className="text-sm text-muted">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Visual: mock evaluation dashboard */}
          <div
            className="animate-fade-up relative"
            style={{ animationDelay: "200ms" }}
          >
            <div className="animate-float relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/30 blur-lg" />
              <div className="relative rounded-2xl border border-border bg-surface/90 p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-400/80" />
                    <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                    <span className="h-3 w-3 rounded-full bg-green-400/80" />
                  </div>
                  <span className="font-mono text-xs text-muted">
                    eval-run #2481
                  </span>
                </div>

                <h2 className="mt-6 text-sm font-medium text-muted">
                  Evaluation Leaderboard
                </h2>

                <ul className="mt-4 space-y-5">
                  {sampleResults.map((r) => (
                    <li key={r.name}>
                      <div className="flex items-center justify-between text-sm">
                        <span>{r.name}</span>
                        <span
                          className={`font-mono ${r.pass ? "text-success" : "text-red-400"}`}
                        >
                          {r.score}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
                        <div
                          className={`h-full rounded-full ${
                            r.pass
                              ? "bg-gradient-to-r from-primary to-accent"
                              : "bg-red-400/70"
                          }`}
                          style={{ width: `${r.score}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-lg border border-border bg-background/60 p-4 font-mono text-xs leading-relaxed text-muted">
                  <span className="text-accent">$</span> evalspace run --suite
                  agents --model all
                  <br />
                  <span className="text-success">✔</span> 1,240 tasks completed
                  · 3 regressions flagged
                </div>
              </div>
            </div>
          </div>
        </section>

        <Features />
        <About />
        <Blog />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
