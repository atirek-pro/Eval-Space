"use client";

import { useId, useState } from "react";

import DataUpload from "@/components/DataUpload";
import ModelSelector from "@/components/ModelSelector";

// Bring-Your-Own-Data: holds what the upload and the model picker report. Run Comparison works once there are
// questions and at least one model (or "Top 25"). Until then it's marked aria-disabled rather than disabled,
// so hovering or focusing it can still show why: a red no-entry cursor and a tooltip. Running isn't connected
// to the API yet.
const LOCKED_MESSAGE = "Please upload your dataset and choose models to run.";

export default function ByodWorkspace() {
  const tipId = useId();
  const [questions, setQuestions] = useState(null);
  const [selection, setSelection] = useState({ topN: false, models: [] });
  const [note, setNote] = useState("");

  const ready = Boolean(questions?.length) && (selection.topN || selection.models.length > 0);

  return (
    <>
      <DataUpload
        onChange={(q) => {
          setQuestions(q);
          setNote("");
        }}
      />
      <ModelSelector
        onChange={(s) => {
          setSelection(s);
          setNote("");
        }}
      />
      <div className="run">
        <span className={`run__wrap${ready ? "" : " is-locked"}`}>
          <button
            className="btn btn--primary run__button"
            type="button"
            aria-disabled={!ready}
            aria-describedby={ready ? undefined : tipId}
            onClick={() => {
              if (!ready) return;
              setNote("Running a comparison isn't connected yet. That's the next step to build.");
            }}
          >
            Run Comparison
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {!ready && (
            <span className="run__tip" id={tipId} role="tooltip">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 1.75 15 14H1z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M8 6.5v3.25M8 11.75v.25" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              {LOCKED_MESSAGE}
            </span>
          )}
        </span>
        {note && (
          <p className="run__note" role="status">
            {note}
          </p>
        )}
      </div>
    </>
  );
}
