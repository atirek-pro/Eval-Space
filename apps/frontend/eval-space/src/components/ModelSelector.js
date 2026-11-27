"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { authRequest } from "@/lib/auth";

// Bring-Your-Own-Data: choose which models answer the uploaded questions. Each provider is a capsule that
// opens a dropdown checklist of its models; picked models show as removable chips under the capsules.
// "Top 25" picks for the user instead: while it's on, the capsules are disabled. Nothing runs yet; this
// only records the choice.
//
// Google's models come live from GET /eval/models (the same list as Manual). The Anthropic and OpenAI lists
// are fixed for now, until the backend can list them: edit them here.
const FIXED_MODELS = {
  anthropic: ["claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5", "claude-fable-5-2"],
  openai: ["gpt-6-luna", "gpt-5.4-pro", "gpt-5.4", "gpt-oss-120b"],
};

const PROVIDERS = [
  { key: "anthropic", name: "Anthropic" },
  { key: "google", name: "Google" },
  { key: "openai", name: "OpenAI" },
];

const TOP_N = 25;
const FILTER_FROM = 8; // show a filter box in dropdowns with more models than this
const MAX_CHIPS = 6; // more picks than this show as "+N more", so the page keeps to one screen
const MENU_HEIGHT = 380; // the tallest a dropdown gets

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// One provider capsule and its dropdown.
function ProviderMenu({ provider, models, status, error, onRetry, picked, onToggle, onSetAll, disabled, open, onOpen, onClose }) {
  const id = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const [filter, setFilter] = useState("");
  const [up, setUp] = useState(false); // open upward when there isn't room below
  const count = models.filter((m) => picked.has(`${provider.key}:${m}`)).length;

  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? models.filter((m) => m.toLowerCase().includes(q)) : models;
  }, [models, filter]);

  // close on a click outside, or Esc anywhere
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) onClose();
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div className={`cap${open ? " is-open" : ""}${up ? " is-up" : ""}`} ref={rootRef}>
      <button
        ref={buttonRef}
        className={`cap__button${count ? " has-picks" : ""}`}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        disabled={disabled}
        onClick={() => {
          if (open) onClose();
          else {
            setFilter("");
            const r = buttonRef.current.getBoundingClientRect();
            setUp(window.innerHeight - r.bottom < MENU_HEIGHT + 16 && r.top > window.innerHeight - r.bottom);
            onOpen();
          }
        }}
      >
        <span className={`cap__dot cap__dot--${provider.key}`} aria-hidden="true"></span>
        {provider.name}
        {count > 0 && <span className="cap__count" aria-label={`${count} selected`}>{count}</span>}
        <span className="cap__chevron">
          <Chevron />
        </span>
      </button>

      {open && (
        <div className="cap__menu" id={`${id}-menu`} role="group" aria-label={`${provider.name} models`}>
          <div className="cap__menu-head">
            <span>{provider.name} models</span>
            {models.length > 0 && (
              <span className="cap__tools">
                <button type="button" className="cap__link" onClick={() => onSetAll(true)}>Select all</button>
                <button type="button" className="cap__link" onClick={() => onSetAll(false)} disabled={!count}>Clear</button>
              </span>
            )}
          </div>
          {models.length > FILTER_FROM && (
            <input
              className="cap__filter"
              type="text"
              placeholder="Filter models…"
              aria-label={`Filter ${provider.name} models`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              autoFocus
            />
          )}
          {status === "loading" && <p className="cap__note">Loading models…</p>}
          {status === "error" && (
            <p className="cap__note cap__note--error">
              Couldn&apos;t load {provider.name}&apos;s models: {error}{" "}
              <button type="button" className="cap__link" onClick={onRetry}>Try again</button>
            </p>
          )}
          {models.length > 0 && (
            <ul className="cap__list">
              {shown.length === 0 && <li className="cap__note">No models match.</li>}
              {shown.map((m) => (
                <li key={m}>
                  <label className="pick">
                    <input type="checkbox" checked={picked.has(`${provider.key}:${m}`)} onChange={() => onToggle(m)} />
                    <span className="pick__box" aria-hidden="true"></span>
                    <span className="pick__name">{m}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// onChange({ topN, models }): called whenever the choice changes; models are "provider:model" keys
export default function ModelSelector({ onChange }) {
  const id = useId();
  const [open, setOpen] = useState(null); // provider key, or null
  const [picked, setPicked] = useState(() => new Set()); // "provider:model", in the order picked
  const [topN, setTopN] = useState(false);
  const [google, setGoogle] = useState({ status: "loading", models: [], error: "" });
  const mounted = useRef(true);

  // report the choice to the parent (the Run Comparison button needs it)
  useEffect(() => {
    onChange?.({ topN, models: [...picked] });
  }, [picked, topN]); // eslint-disable-line react-hooks/exhaustive-deps -- onChange may change identity each render

  const loadGoogle = () =>
    authRequest("/eval/models")
      .then((data) => {
        if (!mounted.current) return;
        const ids = data.models.filter((m) => m.can_query).map((m) => m.id);
        setGoogle({ status: "ready", models: ids, error: "" });
      })
      .catch((err) => {
        if (!mounted.current) return;
        if (err.status === 401) {
          window.location.replace("/signin");
          return;
        }
        setGoogle({ status: "error", models: [], error: err.message });
      });

  useEffect(() => {
    mounted.current = true;
    loadGoogle();
    return () => {
      mounted.current = false;
    };
  }, []); // load the Google list once per visit

  const modelsOf = (key) => (key === "google" ? google.models : FIXED_MODELS[key]);

  const toggle = (key, model) =>
    setPicked((prev) => {
      const next = new Set(prev);
      const k = `${key}:${model}`;
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const setAll = (key, on) =>
    setPicked((prev) => {
      const next = new Set(prev);
      for (const m of modelsOf(key)) {
        if (on) next.add(`${key}:${m}`);
        else next.delete(`${key}:${m}`);
      }
      return next;
    });

  const onTopN = (e) => {
    setTopN(e.target.checked);
    if (e.target.checked) setOpen(null);
  };

  const chips = [...picked].map((k) => {
    const [key, ...rest] = k.split(":");
    return { k, key, model: rest.join(":") };
  });
  const summary = topN ? `Top ${TOP_N} models` : chips.length === 0 ? "None selected" : `${chips.length} selected`;

  return (
    <section className="models" aria-labelledby={`${id}-title`}>
      <header className="models__head">
        <h2 className="models__title" id={`${id}-title`}>Choose models</h2>
        <span className={`models__count${topN || chips.length ? " is-on" : ""}`} aria-live="polite">{summary}</span>
      </header>

      <div className={`models__caps${topN ? " is-disabled" : ""}`}>
        {PROVIDERS.map((p) => (
          <ProviderMenu
            key={p.key}
            provider={p}
            models={modelsOf(p.key)}
            status={p.key === "google" ? google.status : "ready"}
            error={p.key === "google" ? google.error : ""}
            onRetry={() => {
              setGoogle({ status: "loading", models: [], error: "" });
              loadGoogle();
            }}
            picked={picked}
            onToggle={(m) => toggle(p.key, m)}
            onSetAll={(on) => setAll(p.key, on)}
            disabled={topN}
            open={open === p.key && !topN}
            onOpen={() => setOpen(p.key)}
            onClose={() => setOpen((cur) => (cur === p.key ? null : cur))}
          />
        ))}
      </div>

      {!topN && (
        <div className="models__chips" aria-live="polite">
          {chips.length === 0 ? (
            <p className="models__empty">Open a provider to pick its models.</p>
          ) : (
            chips.slice(0, MAX_CHIPS).map(({ k, key, model }) => (
              <span className="chip" key={k}>
                <span className={`cap__dot cap__dot--${key}`} aria-hidden="true"></span>
                <span className="chip__name">{model}</span>
                <button type="button" className="chip__remove" onClick={() => toggle(key, model)} aria-label={`Remove ${model}`} title="Remove">
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="m4.5 4.5 7 7m0-7-7 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </span>
            ))
          )}
          {chips.length > MAX_CHIPS && <span className="chip chip--more">+{chips.length - MAX_CHIPS} more</span>}
        </div>
      )}

      <label className={`topn${topN ? " is-on" : ""}`}>
        <input type="checkbox" checked={topN} onChange={onTopN} />
        <span className="pick__box" aria-hidden="true"></span>
        <span className="topn__text">
          <span className="topn__title">Run on the top {TOP_N} models across providers</span>
          <span className="topn__sub">
            {topN ? "Model selection above is turned off. Untick this to choose models yourself." : "We pick the models for you. Your own choices above are turned off while this is on."}
          </span>
        </span>
      </label>
    </section>
  );
}
