"use client";

import { useEffect, useRef } from "react";

// Draws one kit diagram (public/assets/diagrams/diagram.js) into its own element from an effect, which
// only runs once React has hydrated it, so the drawn SVG never meets React's hydration check. The
// element carries no data-diagram: the kit's auto-mounter would redraw it before hydration.
const DIAGRAM_JS = "/assets/diagrams/diagram.js";

export default function Diagram({ spec }) {
  const ref = useRef(null);

  useEffect(() => {
    let instance;
    let cancelled = false;
    import(/* webpackIgnore: true */ /* turbopackIgnore: true */ DIAGRAM_JS).then(({ default: dg }) => {
      if (!cancelled && ref.current) instance = dg.mount(ref.current, structuredClone(spec));
    });
    return () => {
      cancelled = true;
      instance?.destroy?.();
    };
  }, [spec]);

  return <div className="dg" ref={ref} />;
}
