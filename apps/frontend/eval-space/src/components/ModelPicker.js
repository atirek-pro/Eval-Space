"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

// A dropdown of model ids that scrolls, with a filter box on top, because the Gemini list is long.
// Keyboard: ↑ ↓ move, Enter picks, Esc closes. A click outside closes it.
export default function ModelPicker({ label, models, value, onChange, placeholder }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? models.filter((m) => m.toLowerCase().includes(q)) : models;
  }, [models, filter]);

  // close on a click outside
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // focus the filter box when the list opens
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  // keep the highlighted option in view while moving through the list
  useEffect(() => {
    if (open) listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openList = () => {
    setFilter("");
    setActive(Math.max(0, models.indexOf(value)));
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const choose = (model) => {
    onChange(model);
    close();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, shown.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (shown[active]) choose(shown[active]);
    } else if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.preventDefault();
      close();
    }
  };

  const listId = `${id}-list`;

  return (
    <div className="picker" ref={rootRef}>
      <button
        ref={buttonRef}
        className="picker__button"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${value ?? placeholder}`}
        disabled={models.length === 0}
        onClick={() => (open ? close() : openList())}
      >
        <span className="picker__value">{value ?? placeholder}</span>
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="picker__panel">
          <input
            ref={searchRef}
            className="picker__search"
            type="text"
            role="combobox"
            aria-label={`Filter models for ${label}`}
            aria-controls={listId}
            aria-expanded="true"
            aria-activedescendant={shown[active] ? `${id}-opt-${active}` : undefined}
            placeholder="Filter models…"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
          <ul className="picker__list" id={listId} role="listbox" aria-label={`Models for ${label}`} ref={listRef}>
            {shown.length === 0 ? (
              <li className="picker__none">No models match.</li>
            ) : (
              shown.map((m, i) => (
                <li
                  key={m}
                  id={`${id}-opt-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={m === value}
                  className={`picker__option${i === active ? " is-active" : ""}`}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => choose(m)}
                >
                  {m}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
