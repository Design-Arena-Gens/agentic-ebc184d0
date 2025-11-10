'use client';

import { ChangeEvent, useMemo, useRef } from "react";
import {
  InstructionalRulesetState,
  KnowledgeCompendiumState,
  KnowledgeChunk,
} from "@/types";
import { usePersistentState } from "@/hooks/usePersistentState";
import { chunkKnowledge, serializeCompendium } from "@/lib/kcs";

const IR_STORAGE_KEY = "agentic-ir";
const KCS_STORAGE_KEY = "agentic-kcs";

function convertIRToMarkdown(raw: string): string {
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";
  const lines = normalized.split("\n").filter((line) => line.trim().length > 0);
  const header = "## Instructional Ruleset";
  const bulletLines = lines.map((line) => `- ${line.trim()}`);
  return [header, "", ...bulletLines].join("\n");
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function ModelBlueprintOrganizer() {
  const [irState, setIrState] = usePersistentState<InstructionalRulesetState>(IR_STORAGE_KEY, {
    raw: "",
    markdown: "",
    updatedAt: null,
  });

  const [kcsState, setKcsState] = usePersistentState<KnowledgeCompendiumState>(KCS_STORAGE_KEY, {
    raw: "",
    chunks: [],
    format: "json",
    chunkSize: 400,
    updatedAt: null,
  });

  const irFileInput = useRef<HTMLInputElement | null>(null);
  const kcsFileInput = useRef<HTMLInputElement | null>(null);

  const chunkPreview = useMemo(() => {
    const chunks = kcsState.chunks;
    if (!chunks.length) return null;
    const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.metadata.tokenEstimate, 0);
    return {
      count: chunks.length,
      totalTokens,
      averageTokens: Math.round(totalTokens / chunks.length),
    };
  }, [kcsState.chunks]);

  const handleIRFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      setIrState({
        raw: text,
        markdown: convertIRToMarkdown(text),
        updatedAt: Date.now(),
      });
    });
    event.target.value = "";
  };

  const handleKCSFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      const chunks = chunkKnowledge(text, kcsState.chunkSize);
      setKcsState({
        raw: text,
        chunks,
        format: kcsState.format,
        chunkSize: kcsState.chunkSize,
        updatedAt: Date.now(),
      });
    });
    event.target.value = "";
  };

  const saveIR = () => {
    setIrState({
      raw: irState.raw,
      markdown: convertIRToMarkdown(irState.raw),
      updatedAt: Date.now(),
    });
  };

  const saveKCS = () => {
    const chunks = chunkKnowledge(kcsState.raw, kcsState.chunkSize);
    setKcsState({
      ...kcsState,
      chunks,
      updatedAt: Date.now(),
    });
  };

  const exportIR = () => {
    if (!irState.markdown) return;
    downloadFile("instructional-ruleset.md", irState.markdown, "text/markdown");
  };

  const exportKCS = () => {
    if (!kcsState.chunks.length) return;
    const serialized = serializeCompendium(kcsState.chunks, kcsState.format);
    const extension = kcsState.format === "jsonl" ? "jsonl" : "json";
    downloadFile(`knowledge-compendium.${extension}`, serialized, "application/json");
  };

  return (
    <section className="blueprint-section">
      <header>
        <h2>Gemini/GPT Blueprint Organizer</h2>
        <p>
          Capture the Instructional Ruleset (IR) and Knowledge Compendium Synthesis (KCS). The IR is
          auto-converted into Markdown for persona clarity. The KCS is chunked into JSON or JSONL
          with metadata for downstream mapping.
        </p>
      </header>
      <div className="blueprint-grid">
        <article className="card blueprint-card">
          <header>
            <h3>Instructional Ruleset (IR)</h3>
            <p>
              Author or import your raw IR. Saving transforms each line into Markdown bullet points
              under a shared heading for quick reuse and export.
            </p>
          </header>
          <textarea
            rows={12}
            value={irState.raw}
            onChange={(event) =>
              setIrState({
                ...irState,
                raw: event.target.value,
              })
            }
            placeholder="Draft persona, guardrails, and behavioral rules..."
          />
          <div className="card-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => irFileInput.current?.click()}
            >
              Import Text File
            </button>
            <input
              type="file"
              accept=".txt,.md"
              ref={irFileInput}
              onChange={handleIRFile}
              hidden
            />
            <button type="button" className="primary" onClick={saveIR} disabled={!irState.raw}>
              Save &amp; Convert to Markdown
            </button>
            <button
              type="button"
              onClick={exportIR}
              className="ghost"
              disabled={!irState.markdown}
            >
              Export Markdown
            </button>
          </div>
          <div className="markdown-preview">
            <header>
              <h4>Markdown Preview</h4>
              {irState.updatedAt && (
                <time dateTime={new Date(irState.updatedAt).toISOString()}>
                  Updated {new Date(irState.updatedAt).toLocaleString()}
                </time>
              )}
            </header>
            {irState.markdown ? (
              <pre>{irState.markdown}</pre>
            ) : (
              <p className="empty-state">Save to generate Markdown.</p>
            )}
          </div>
        </article>
        <article className="card blueprint-card">
          <header>
            <h3>Knowledge Compendium Synthesis (KCS)</h3>
            <p>
              Store research and references. Saving chunks the text and appends metadata for mapping.
              Choose JSON or JSONL export for downstream ingestion.
            </p>
          </header>
          <textarea
            rows={12}
            value={kcsState.raw}
            onChange={(event) =>
              setKcsState({
                ...kcsState,
                raw: event.target.value,
              })
            }
            placeholder="Knowledge compendium content, e.g. research notes..."
          />
          <div className="kcs-controls">
            <label className="field">
              <span>Chunk size (characters)</span>
              <input
                type="number"
                min={100}
                max={1200}
                step={50}
                value={kcsState.chunkSize}
                onChange={(event) =>
                  setKcsState({
                    ...kcsState,
                    chunkSize: Number(event.target.value),
                  })
                }
              />
            </label>
            <fieldset className="field format-toggle">
              <legend>Export format</legend>
              <label>
                <input
                  type="radio"
                  name="kcs-format"
                  value="json"
                  checked={kcsState.format === "json"}
                  onChange={() =>
                    setKcsState({
                      ...kcsState,
                      format: "json",
                    })
                  }
                />
                JSON
              </label>
              <label>
                <input
                  type="radio"
                  name="kcs-format"
                  value="jsonl"
                  checked={kcsState.format === "jsonl"}
                  onChange={() =>
                    setKcsState({
                      ...kcsState,
                      format: "jsonl",
                    })
                  }
                />
                JSONL
              </label>
            </fieldset>
          </div>
          <div className="card-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => kcsFileInput.current?.click()}
            >
              Import Text File
            </button>
            <input
              type="file"
              accept=".txt,.md"
              ref={kcsFileInput}
              onChange={handleKCSFile}
              hidden
            />
            <button type="button" className="primary" onClick={saveKCS} disabled={!kcsState.raw}>
              Save &amp; Chunk
            </button>
            <button
              type="button"
              onClick={exportKCS}
              className="ghost"
              disabled={!kcsState.chunks.length}
            >
              Export {kcsState.format.toUpperCase()}
            </button>
          </div>
          {chunkPreview ? (
            <div className="chunk-preview">
              <header>
                <h4>Chunk Summary</h4>
                {kcsState.updatedAt && (
                  <time dateTime={new Date(kcsState.updatedAt).toISOString()}>
                    Updated {new Date(kcsState.updatedAt).toLocaleString()}
                  </time>
                )}
              </header>
              <ul>
                <li>
                  <strong>{chunkPreview.count}</strong> chunks
                </li>
                <li>
                  <strong>{chunkPreview.totalTokens}</strong> estimated tokens
                </li>
                <li>
                  <strong>{chunkPreview.averageTokens}</strong> average tokens per chunk
                </li>
              </ul>
              <div className="chunk-list">
                {kcsState.chunks.map((chunk: KnowledgeChunk) => (
                  <details key={chunk.id}>
                    <summary>
                      {chunk.metadata.chunkId} · est. {chunk.metadata.tokenEstimate} tokens
                    </summary>
                    <pre>{JSON.stringify(chunk, null, 2)}</pre>
                  </details>
                ))}
              </div>
            </div>
          ) : (
            <p className="empty-state">Save to generate chunk metadata.</p>
          )}
        </article>
      </div>
    </section>
  );
}
