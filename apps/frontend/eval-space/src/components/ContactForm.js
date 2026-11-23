"use client";

import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted/70 outline-none transition-colors focus:border-primary-soft focus:ring-2 focus:ring-primary/30";

export default function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent

  // TODO: connect to a real backend (API route / Server Action / email service).
  // For now we just simulate a successful send.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("sending");
    await new Promise((resolve) => setTimeout(resolve, 800));
    event.target.reset();
    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <div className="flex h-full flex-col items-center justify-center py-12 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
            aria-hidden="true"
          >
            <path d="m5 12 5 5L20 7" />
          </svg>
        </span>
        <h3 className="mt-5 text-xl font-semibold">Message sent!</h3>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Thanks for reaching out. Our team will get back to you within one
          business day.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-medium text-accent hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Jane Doe"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="jane@company.com"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="topic" className="mb-2 block text-sm font-medium">
          Topic
        </label>
        <select
          id="topic"
          name="topic"
          defaultValue="demo"
          className={inputClass}
        >
          <option value="demo">Request a demo</option>
          <option value="sales">Pricing &amp; plans</option>
          <option value="support">Technical support</option>
          <option value="partnership">Partnership</option>
          <option value="other">Something else</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Tell us about the models or agents you want to evaluate…"
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3 font-medium text-white shadow-lg shadow-primary/30 transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
