import KitScripts from "@/components/KitScripts";

/*
  The page runs on the tasteskill kit, copied unchanged into public/assets and loaded as plain files
  (references/system.md, layout-v4.md). The kit's stylesheets sit in <head> in the starter's order, then the
  dealt :root palette and type, then the page's own CSS (public/eval-space.css). The kit's modules load from
  KitScripts' effect, after React has hydrated, so the DOM they add (pause buttons, the phone sheet,
  the hero's word masks) never meets React's hydration check.

  type: software · deal: hero collage, footer-dark, rhythm space, buttons solid,
  mark ring, ground sand, palette lunar-grey-bronze, type funnel; effect painterly-landscape (hero frame),
  card ground gradient-mesh; moment liquid-type (#about).
*/

export const metadata = {
  // the site's address for share images; set SITE_URL once the domain is known
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: "Eval Space: evaluation platform for LLMs and AI agents",
  description:
    "Benchmark models, agents and harnesses on one test suite, score open answers and catch regressions before release.",
  // canonical: add alternates.canonical once the client's domain is known.
  openGraph: {
    type: "website",
    title: "Eval Space: evaluation platform for LLMs and AI agents",
    description:
      "One test suite across every model and agent harness, with scores you can repeat.",
    images: ["/share.jpg"],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
  other: { "site-kind": "software", "page-type": "software" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#111111",
};

const palette = `
:root {
  --p-bg: #111111; --p-surface: #1c1c1c; --p-ink: #f2f2f2; --p-muted: #8f8f8f;
  --p-accent: #a08672; --p-accent-ink: #111111; --p-action: #7d6552; --p-action-ink: #ffffff;
  --p-inv-bg: #f2f2f2; --p-inv-surface: #e0e0e0; --p-inv-ink: #111111; --p-inv-muted: #5c5c5c;
  --p-inv-accent: #a08672; --p-inv-accent-ink: #111111; --p-inv-action: #7d6552; --p-inv-action-ink: #ffffff;
  --font-display: "Funnel Display", system-ui, sans-serif;
  --font-text: "Funnel Sans", system-ui, sans-serif;
  --font-mono: "DM Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  --display-weight: 400;
  --display-tracking: -0.03em;
  --display-tracking-xl: -0.04em;
  --ly-scale: 0.98;
}`;

const enterLine =
  "document.documentElement.classList.add('m-enter');setTimeout(()=>document.documentElement.classList.add('m-enter-done'),700)";
const momentsLine =
  "document.documentElement.classList.add('mo-js');setTimeout(()=>document.documentElement.classList.add('mo-safe'),2500)";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-type="software"
      data-radius="soft"
      data-ground="sand"
      data-buttons="solid"
      data-motion=""
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@400..700&family=Funnel+Sans:wght@400..600&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/system.css" />
        <link rel="stylesheet" href="/assets/ui/cards.css" />
        <link rel="stylesheet" href="/assets/motion/motion.css" />
        <link rel="stylesheet" href="/assets/backgrounds/backgrounds.css" />
        <link rel="stylesheet" href="/assets/layout/layout.css" />
        <link rel="stylesheet" href="/assets/icons/icon.css" />
        <style dangerouslySetInnerHTML={{ __html: palette }} />
        <link rel="stylesheet" href="/assets/ui/base.css" />
        <link rel="stylesheet" href="/assets/ui/window/fragment.css" />
        <link rel="stylesheet" href="/assets/ui/checklist/fragment.css" />
        <link rel="stylesheet" href="/assets/ui/toggles/fragment.css" />
        <link rel="stylesheet" href="/assets/ui/stat/fragment.css" />
        <link rel="stylesheet" href="/assets/diagrams/diagram.css" />
        <link rel="stylesheet" href="/eval-space.css" />
        <script dangerouslySetInnerHTML={{ __html: enterLine }} />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/assets/backgrounds/backgrounds.js" />
        <script dangerouslySetInnerHTML={{ __html: momentsLine }} />
        <link rel="modulepreload" href="/assets/moments/moments.js" />
        <link rel="modulepreload" href="/assets/moments/lib.js" />
        <link rel="modulepreload" href="/assets/moments/liquid-type/moment.js" />
      </head>
      <body>
        {children}
        <KitScripts />
      </body>
    </html>
  );
}
