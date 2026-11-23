import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";

// Dummy posts — will be replaced once the dedicated blog is built.
const posts = [
  {
    slug: "why-benchmarks-lie",
    category: "Research",
    title: "Why Leaderboard Scores Don't Tell the Whole Story",
    excerpt:
      "Static benchmarks saturate fast. Here's how to design evals that still reflect real-world performance.",
    date: "Nov 18, 2026",
    readTime: "6 min read",
  },
  {
    slug: "evaluating-agent-harnesses",
    category: "Agents",
    title: "A Practical Guide to Evaluating Agent Harnesses",
    excerpt:
      "Tool calls, retries and long-horizon tasks — what to measure when your model is acting, not just answering.",
    date: "Nov 10, 2026",
    readTime: "8 min read",
  },
  {
    slug: "llm-as-judge-pitfalls",
    category: "Methodology",
    title: "LLM-as-Judge: Five Pitfalls and How to Avoid Them",
    excerpt:
      "Model-graded scoring scales beautifully — until bias creeps in. Lessons from thousands of graded runs.",
    date: "Nov 02, 2026",
    readTime: "5 min read",
  },
];

export default function Blog() {
  return (
    <section
      id="blog"
      className="relative mx-auto max-w-7xl scroll-mt-20 px-6 pt-16 pb-16 lg:pt-20 lg:pb-20"
    >
      <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <span className="text-sm font-medium uppercase tracking-widest text-accent">
            Blog
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Insights from the{" "}
            <span className="bg-gradient-to-r from-primary-soft to-accent bg-clip-text text-transparent">
              eval frontier
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted">
            Research notes, guides and lessons learned from evaluating AI
            systems at scale.
          </p>
        </div>
        <Link
          href="/blog"
          className="shrink-0 rounded-full border border-border bg-surface/60 px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary-soft"
        >
          View all posts →
        </Link>
      </Reveal>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <Reveal key={post.slug} delay={(i % 3) * 120}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface/70 transition-all hover:-translate-y-1 hover:border-primary-soft/60 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={`https://picsum.photos/seed/evalspace-${post.slug}/800/500`}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-primary-soft backdrop-blur">
                  {post.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>{post.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold leading-snug transition-colors group-hover:text-primary-soft">
                  {post.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {post.excerpt}
                </p>
                <span className="mt-5 text-sm font-medium text-accent">
                  Read more{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
