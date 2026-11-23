import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/signup", label: "Create Account" },
      { href: "/#contact", label: "Request a Demo" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#about", label: "About Us" },
      { href: "/#blog", label: "Blog" },
      { href: "/#contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

// Placeholder social links — replace "#" with real profile URLs.
const socials = [
  {
    label: "X (Twitter)",
    href: "#",
    icon: <path d="M4 4l16 16M20 4 4 20" />,
  },
  {
    label: "GitHub",
    href: "#",
    icon: (
      <path d="M9 19c-4 1.5-4-2-6-2.5m12 5v-3.5a3 3 0 0 0-.9-2.3c3-.3 6.1-1.5 6.1-6.6a5.2 5.2 0 0 0-1.4-3.6 4.8 4.8 0 0 0-.1-3.6s-1.1-.3-3.7 1.4a12.7 12.7 0 0 0-6.6 0C5.8 1.6 4.7 1.9 4.7 1.9a4.8 4.8 0 0 0-.1 3.6A5.2 5.2 0 0 0 3.2 9c0 5.1 3.1 6.3 6.1 6.6a3 3 0 0 0-.9 2.3V22" />
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2V9Zm2-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" />
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Brand + newsletter blurb */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
                ES
              </span>
              <span className="text-lg font-semibold tracking-tight">
                Eval<span className="text-accent">Space</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              The evaluation platform for AI models and agent harnesses.
              Benchmark, compare and ship AI you can trust.
            </p>

            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted transition-colors hover:border-primary-soft hover:text-foreground"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    {s.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold">{col.title}</h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted sm:flex-row">
          <p>© 2026 Eval Space. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}
