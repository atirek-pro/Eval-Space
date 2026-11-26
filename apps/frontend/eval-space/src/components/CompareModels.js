"use client";

import { useEffect, useRef, useState } from "react";

import ChatPane from "@/components/ChatPane";
import { authRequest } from "@/lib/auth";

// Compare Models: loads the Gemini model list once (GET /eval/models) and gives it to both chats.
// Only models that can answer a query (can_query) are offered; each is shown by its id.
export default function CompareModels() {
  const [state, setState] = useState({ status: "loading", models: [], error: "" });
  const mounted = useRef(true);

  const fetchModels = () =>
    authRequest("/eval/models")
      .then((data) => {
        if (!mounted.current) return;
        const ids = data.models.filter((m) => m.can_query).map((m) => m.id);
        setState({ status: ids.length ? "ready" : "empty", models: ids, error: "" });
      })
      .catch((err) => {
        if (!mounted.current) return;
        if (err.status === 401) {
          window.location.replace("/signin");
          return;
        }
        setState({ status: "error", models: [], error: err.message });
      });

  useEffect(() => {
    mounted.current = true;
    fetchModels();
    return () => {
      mounted.current = false;
    };
  }, []); // load the list once per visit

  const retry = () => {
    setState({ status: "loading", models: [], error: "" });
    fetchModels();
  };

  const { status, models, error } = state;
  const placeholder = status === "loading" ? "Loading models…" : status === "ready" ? "Choose a model" : "No models";

  return (
    <>
      {(status === "error" || status === "empty") && (
        <div className="compare__alert" role="alert">
          <span>{status === "error" ? `Couldn't load the model list: ${error}` : "No models are available to chat with."}</span>
          <button className="btn btn--secondary btn--sm" type="button" onClick={retry}>
            Try again
          </button>
        </div>
      )}
      <div className="compare__chats">
        <ChatPane label="Model A" models={models} initialModel={0} placeholder={placeholder} />
        <ChatPane label="Model B" models={models} initialModel={1} placeholder={placeholder} />
      </div>
    </>
  );
}
