// blog: three recent posts as cards on one row. Placeholder posts until the blog itself is built.
const posts = [
  {
    category: "Research",
    title: "Why leaderboard scores don't tell the whole story",
    excerpt: "Static benchmarks saturate fast. How to design evals that still reflect real use.",
    date: "Nov 18, 2026",
    read: "6 min read",
  },
  {
    category: "Agents",
    title: "A practical guide to evaluating agent harnesses",
    excerpt: "Tool calls, retries and long tasks: what to measure when a model acts, not just answers.",
    date: "Nov 10, 2026",
    read: "8 min read",
  },
  {
    category: "Methodology",
    title: "Model-graded scoring: five pitfalls and how to avoid them",
    excerpt: "Model judges scale well until bias creeps in. Lessons from thousands of graded runs.",
    date: "Nov 2, 2026",
    read: "5 min read",
  },
];

const arrow = (
  <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true">
    <path className="m-arrow__stem" d="M1 6h8" />
    <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
  </svg>
);

export default function Blog() {
  return (
    <section className="section" id="blog" aria-labelledby="blog-h">
      <div className="wrap">
        <div className="section-head">
          <h2 id="blog-h">
            From the blog. <span className="muted">Notes on evaluating models and agents.</span>
          </h2>
        </div>
        <div className="grid">
          {posts.map((post) => (
            <article className="card blog-card span-4" key={post.title}>
              <p className="t-label muted blog-card__cat">{post.category}</p>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <p className="t-small muted blog-card__meta">{post.date} · {post.read}</p>
              <a className="card__link" href="#blog" aria-label={`Read: ${post.title}`}>Read the post{arrow}</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
