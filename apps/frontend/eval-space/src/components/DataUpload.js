"use client";

import { useEffect, useId, useRef, useState } from "react";

// Bring-Your-Own-Data: upload a CSV of questions. Layout: heading, then the drop zone (or, once a file is in,
// its card and a preview of the first questions).
// The file is checked in the browser (a "question" column, at least one question); nothing is sent to the
// API yet.

const MAX_BYTES = 5 * 1024 * 1024;
const REQUIRED_COLUMN = "question";
const PREVIEW_ROWS = 3;

// A small CSV reader: commas, quoted fields with "" escapes and line breaks inside quotes, CRLF, a UTF-8 BOM.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Resolves to { questions } or { error } for the chosen file.
async function checkFile(file) {
  if (!file.name.toLowerCase().endsWith(".csv")) return { error: "Choose a .csv file." };
  if (file.size === 0) return { error: "This file is empty." };
  if (file.size > MAX_BYTES) return { error: `This file is ${formatSize(file.size)}. The limit is 5 MB.` };

  const rows = parseCsv(await file.text());
  const header = (rows[0] ?? []).map((h) => h.trim().toLowerCase());
  const col = header.indexOf(REQUIRED_COLUMN);
  if (col === -1) {
    return { error: `No "${REQUIRED_COLUMN}" column found. The first row must name the columns, including "${REQUIRED_COLUMN}".` };
  }
  const questions = rows.slice(1).map((r) => (r[col] ?? "").trim()).filter(Boolean);
  if (questions.length === 0) return { error: `The "${REQUIRED_COLUMN}" column has no questions in it.` };
  return { questions };
}

const FileIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M5.5 2.75h6l3.75 3.75v10.75H5.5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M11.5 2.75V6.5h3.75M8 11h4.5M8 14h4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// onChange(questions | null): called with the file's questions when one is accepted, null when it's removed
export default function DataUpload({ onChange }) {
  const id = useId();
  const inputRef = useRef(null);
  const infoRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [checking, setChecking] = useState(false);
  const [file, setFile] = useState(null); // { name, size, questions }
  const [error, setError] = useState("");
  const [tipOpen, setTipOpen] = useState(false);

  const setFileAndReport = (next) => {
    setFile(next);
    onChange?.(next ? next.questions : null);
  };

  // a tapped-open tooltip closes on any tap or click outside it (Safari doesn't focus buttons on tap, so blur
  // alone can't be relied on)
  useEffect(() => {
    if (!tipOpen) return;
    const onDown = (e) => {
      if (!infoRef.current?.contains(e.target)) setTipOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [tipOpen]);

  const take = async (picked) => {
    if (!picked) return;
    setError("");
    setChecking(true);
    try {
      const result = await checkFile(picked);
      if (result.error) {
        setFileAndReport(null);
        setError(result.error);
      } else {
        setFileAndReport({ name: picked.name, size: picked.size, questions: result.questions });
      }
    } catch {
      setFileAndReport(null);
      setError("Couldn't read this file. Check it's a plain-text CSV and try again.");
    } finally {
      setChecking(false);
      if (inputRef.current) inputRef.current.value = ""; // picking the same file again still fires change
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    take(e.dataTransfer.files?.[0]);
  };

  const tipId = `${id}-tip`;
  const inputId = `${id}-input`;

  return (
    <section className="upload" aria-labelledby={`${id}-title`}>
      <header className="upload__head">
        <h2 id={`${id}-title`} className="upload__title">Upload your questions</h2>
        <span className={`info${tipOpen ? " is-open" : ""}`} ref={infoRef}>
          <button
            className="info__button"
            type="button"
            aria-label="What should the file contain?"
            aria-describedby={tipId}
            aria-expanded={tipOpen}
            onClick={() => setTipOpen((o) => !o)}
            onBlur={() => setTipOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setTipOpen(false)}
          >
            i
          </button>
          <span className="info__tip" id={tipId} role="tooltip">
            Your file needs one column named <code>question</code>, with one question per row. The first row holds the
            column names. Other columns are ignored.
          </span>
        </span>
      </header>

      <div className="upload__main">
        {file ? (
          <>
            <div className="upload__file" role="status">
              <span className="upload__file-icon">
                <FileIcon />
              </span>
              <span className="upload__file-info">
                <span className="upload__file-name">{file.name}</span>
                <span className="upload__file-meta">
                  {formatSize(file.size)} · {file.questions.length} {file.questions.length === 1 ? "question" : "questions"}
                </span>
              </span>
              <label className="upload__replace" htmlFor={inputId}>Replace</label>
              <button className="upload__remove" type="button" onClick={() => setFileAndReport(null)} aria-label={`Remove ${file.name}`} title="Remove">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="preview">
              <p className="preview__head">
                Preview
                <span>
                  {Math.min(PREVIEW_ROWS, file.questions.length)} of {file.questions.length}
                </span>
              </p>
              <ol className="preview__list">
                {file.questions.slice(0, PREVIEW_ROWS).map((q, i) => (
                  <li key={i} className="preview__row">
                    <span className="preview__num">{i + 1}</span>
                    <span className="preview__text" title={q}>{q}</span>
                  </li>
                ))}
              </ol>
              {file.questions.length > PREVIEW_ROWS && (
                <p className="preview__more">+ {file.questions.length - PREVIEW_ROWS} more</p>
              )}
            </div>
          </>
        ) : (
          <label
            className={`upload__drop${dragging ? " is-dragging" : ""}`}
            htmlFor={inputId}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            aria-busy={checking}
          >
            {/* a spreadsheet file: a page with a folded corner and a small table on it */}
            <span className="upload__drop-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48">
                <path d="M13 5.5h15.5L37 14v26.5a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2v-33a2 2 0 0 1 2-2z" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M28.5 5.5V12a2 2 0 0 0 2 2H37" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <rect x="16" y="20" width="16" height="15" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="M16 25h16M16 30h16M22 20v15" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
            <span className="upload__drop-text">{checking ? "Checking the file…" : "Drag and drop your CSV here"}</span>
            <span className="upload__drop-or" aria-hidden="true">or</span>
            <span className="btn btn--primary btn--sm upload__choose">Choose file</span>
            <span className="upload__drop-hint">CSV, up to 5 MB</span>
          </label>
        )}

        <input
          ref={inputRef}
          id={inputId}
          className="sr-only"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => take(e.target.files?.[0])}
        />

        {error && (
          <p className="upload__error" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
