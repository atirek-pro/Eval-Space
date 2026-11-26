"use client";

import { useEffect, useId, useRef, useState } from "react";

import ModelPicker from "@/components/ModelPicker";
import { authRequest } from "@/lib/auth";

// One chat on the Compare Models screen: pick a model, send a query, read the model's reply.
// models: the Gemini model ids from GET /eval/models (empty while loading). Until the user picks one, the
// chat uses models[initialModel]. Each send calls POST /eval/query with this chat's query and model.

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

function UserIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="7" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.75 16.5c.9-3 3.3-4.5 6.25-4.5s5.35 1.5 6.25 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AiIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 2.5 11.6 7.4a1.5 1.5 0 0 0 1 1L17.5 10l-4.9 1.6a1.5 1.5 0 0 0-1 1L10 17.5l-1.6-4.9a1.5 1.5 0 0 0-1-1L2.5 10l4.9-1.6a1.5 1.5 0 0 0 1-1z" fill="currentColor" />
    </svg>
  );
}

function Message({ m }) {
  const mine = m.role === "user";
  return (
    <article className={`msg msg--${m.role}${m.status === "error" ? " msg--error" : ""}`}>
      <span className="msg__avatar">{mine ? <UserIcon /> : <AiIcon />}</span>
      <div className="msg__body">
        <header className="msg__meta">
          <span className="msg__name">{mine ? "You" : m.model}</span>
          <time dateTime={m.time.toISOString()}>{timeFormat.format(m.time)}</time>
        </header>
        {m.status === "pending" ? (
          <p className="msg__text msg__typing" aria-label={`${m.model} is replying`}>
            <span></span>
            <span></span>
            <span></span>
          </p>
        ) : (
          <p className="msg__text">{m.text}</p>
        )}
      </div>
    </article>
  );
}

export default function ChatPane({ label, models, initialModel = 0, placeholder }) {
  const id = useId();
  const [picked, setPicked] = useState(null);
  const model = picked ?? models[initialModel] ?? models[0] ?? null;
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const nextId = useRef(0);

  // keep the newest message in view
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  const update = (msgId, changes) =>
    setMessages((list) => list.map((m) => (m.id === msgId ? { ...m, ...changes } : m)));

  const send = async (e) => {
    e.preventDefault();
    const query = draft.trim();
    if (!query || !model || busy) return;

    const replyId = ++nextId.current;
    const now = new Date();
    setMessages((list) => [
      ...list,
      { id: ++nextId.current, role: "user", text: query, time: now },
      { id: replyId, role: "ai", model, status: "pending", time: now },
    ]);
    setDraft("");
    setBusy(true);

    try {
      const data = await authRequest("/eval/query", { method: "POST", body: { query, model } });
      update(replyId, { status: "done", text: data.answer, model: data.model, time: new Date() });
    } catch (err) {
      if (err.status === 401) {
        window.location.replace("/signin");
        return;
      }
      update(replyId, { status: "error", text: err.message, time: new Date() });
    } finally {
      setBusy(false);
    }
  };

  // Enter sends, Shift+Enter starts a new line
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      e.currentTarget.form.requestSubmit();
    }
  };

  return (
    <section className="chat" aria-label={`${label}: ${model ?? placeholder}`}>
      <header className="chat__head">
        <span className="chat__label">{label}</span>
        <ModelPicker label={label} models={models} value={model} onChange={setPicked} placeholder={placeholder} />
      </header>

      <div className="chat__log" ref={listRef} role="log" aria-live="polite">
        {messages.length === 0 ? (
          <p className="chat__empty">
            {model ? `Send a message to start chatting with ${model}.` : "Choose a model to start chatting."}
          </p>
        ) : (
          messages.map((m) => <Message key={m.id} m={m} />)
        )}
      </div>

      <form className="chat__composer" onSubmit={send}>
        <label className="sr-only" htmlFor={`${id}-input`}>Message {model ?? label}</label>
        <div className="chat__box">
          <textarea
            id={`${id}-input`}
            className="chat__input"
            rows={2}
            placeholder={model ? `Message ${model}…` : "Choose a model first"}
            disabled={!model}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button
            className="chat__send"
            type="submit"
            disabled={!draft.trim() || !model || busy}
            aria-label={busy ? "Waiting for the reply" : "Send"}
            title={busy ? "Waiting for the reply" : "Send"}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 15.5v-11M5 9l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </form>
    </section>
  );
}
