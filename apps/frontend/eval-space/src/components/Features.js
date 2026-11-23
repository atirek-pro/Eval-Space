import Reveal from "@/components/Reveal";

const features = [
  {
    title: "Multi-Model Benchmarking",
    description:
      "Run the same evaluation suite across any number of LLMs and compare accuracy, latency and cost side by side.",
    icon: <path d="M3 3v18h18M7 16v-4m5 4V8m5 8v-6" />,
  },
  {
    title: "Agent Harness Testing",
    description:
      "Evaluate agents end to end — tool calls, multi-step reasoning and task completion inside realistic harnesses.",
    icon: (
      <path d="M9 3h6m-3 0v4m-6 4a6 6 0 1 0 12 0 6 6 0 0 0-12 0Zm4 0h.01M14 11h.01M10 14h4" />
    ),
  },
  {
    title: "Custom Eval Suites",
    description:
      "Bring your own datasets, graders and rubrics, or start from 50+ ready-made benchmarks.",
    icon: <path d="M4 6h16M4 12h10M4 18h7m9-3-3 3-1.5-1.5" />,
  },
  {
    title: "Regression Tracking",
    description:
      "Catch quality drops before they ship. Every run is versioned so you can see exactly what changed.",
    icon: <path d="M3 17l6-6 4 4 8-8m0 0h-5m5 0v5" />,
  },
  {
    title: "LLM-as-Judge Scoring",
    description:
      "Combine exact-match, heuristic and model-graded scoring to judge open-ended answers at scale.",
    icon: (
      <path d="M12 3v18m-7-4 3-8 3 8a3 3 0 0 1-6 0Zm8 0 3-8 3 8a3 3 0 0 1-6 0ZM6 7h12" />
    ),
  },
  {
    title: "Safety & Red-Teaming",
    description:
      "Probe models for jailbreaks, harmful output and policy violations with built-in adversarial suites.",
    icon: (
      <path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Zm-3 9 2 2 4-4" />
    ),
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative mx-auto max-w-7xl scroll-mt-20 px-6 pt-12 pb-16 lg:pt-16 lg:pb-20"
    >
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-medium uppercase tracking-widest text-accent">
          Features
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you need to{" "}
          <span className="bg-gradient-to-r from-primary-soft to-accent bg-clip-text text-transparent">
            evaluate AI
          </span>
        </h2>
        <p className="mt-4 text-lg text-muted">
          From quick model comparisons to full agent harness runs — Eval Space
          gives your team one place to test, score and track AI systems.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <Reveal key={feature.title} delay={(i % 3) * 120}>
            <div className="group h-full rounded-2xl border border-border bg-surface/70 p-6 transition-all hover:-translate-y-1 hover:border-primary-soft/60 hover:shadow-xl hover:shadow-primary/10">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-accent ring-1 ring-border transition-colors group-hover:text-primary-soft">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  {feature.icon}
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
