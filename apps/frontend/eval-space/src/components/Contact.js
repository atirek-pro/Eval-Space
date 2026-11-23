import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";

// Placeholder contact details — replace with real ones.
const contactItems = [
  {
    label: "Email us",
    value: "hello@evalspace.example",
    href: "mailto:hello@evalspace.example",
    icon: <path d="M4 6h16v12H4V6Zm0 0 8 7 8-7" />,
  },
  {
    label: "Call us",
    value: "+1 (555) 010-2026",
    href: "tel:+15550102026",
    icon: (
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    ),
  },
  {
    label: "Visit us",
    value: "Remote-first · Worldwide",
    icon: (
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    ),
  },
];

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative mx-auto max-w-7xl scroll-mt-20 px-6 pt-16 pb-24 lg:pt-20"
    >
      <div className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 mx-auto h-[400px] max-w-3xl rounded-full bg-primary/15 blur-[120px]" />

      <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
        {/* Left: intro + contact details */}
        <Reveal direction="left" className="lg:col-span-2">
          <span className="text-sm font-medium uppercase tracking-widest text-accent">
            Contact Us
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Let&rsquo;s{" "}
            <span className="bg-gradient-to-r from-primary-soft to-accent bg-clip-text text-transparent">
              talk evals
            </span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Want a demo, have a question about your use case, or interested in
            partnering? Drop us a message and we&rsquo;ll get back to you
            quickly.
          </p>

          <ul className="mt-10 space-y-6">
            {contactItems.map((item) => {
              const content = (
                <>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-accent ring-1 ring-border">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      {item.icon}
                    </svg>
                  </span>
                  <span>
                    <span className="block text-xs text-muted">
                      {item.label}
                    </span>
                    <span className="block font-medium">{item.value}</span>
                  </span>
                </>
              );
              return (
                <li key={item.label}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="flex items-center gap-4 transition-colors hover:text-primary-soft"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="flex items-center gap-4">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </Reveal>

        {/* Right: form */}
        <Reveal direction="right" delay={150} className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-surface/80 p-6 shadow-2xl sm:p-8">
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
