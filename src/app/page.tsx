"use client";

import { FormEvent, useEffect, useState } from "react";

type QueryItem = {
  id: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
  createdAt: string;
};

type CompareResult =
  | { model: string; text: string }
  | { error: string };

type Tab = "single" | "compare" | "history";

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("single");

  // --- Single query state ---
  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState<"openai" | "gemini">("openai");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [latestResponse, setLatestResponse] = useState("");

  // --- Compare state ---
  const [cmpPrompt, setCmpPrompt] = useState("");
  const [cmpOpenaiModel, setCmpOpenaiModel] = useState("");
  const [cmpGeminiModel, setCmpGeminiModel] = useState("");
  const [cmpLoading, setCmpLoading] = useState(false);
  const [cmpError, setCmpError] = useState("");
  const [cmpResults, setCmpResults] = useState<{ openai?: CompareResult; gemini?: CompareResult } | null>(null);

  // --- History state ---
  const [items, setItems] = useState<QueryItem[]>([]);
  const [histError, setHistError] = useState("");

  async function loadHistory() {
    const res = await fetch("/api/queries");
    const data = await res.json();
    setItems(data.items ?? []);
  }

  useEffect(() => {
    loadHistory().catch((err) => setHistError(err?.message || "Could not load history"));
  }, []);

  async function onSingleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, provider, model: model || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setLatestResponse(data.response);
      setPrompt("");
      await loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  async function onCompareSubmit(event: FormEvent) {
    event.preventDefault();
    setCmpError("");
    setCmpResults(null);
    setCmpLoading(true);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: cmpPrompt,
          openaiModel: cmpOpenaiModel || undefined,
          geminiModel: cmpGeminiModel || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Compare failed");
      setCmpResults(data.results);
      await loadHistory();
    } catch (err) {
      setCmpError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setCmpLoading(false);
    }
  }

  return (
    <main className="stack">
      <div>
        <h1>Answer Engine Tracker</h1>
        <p className="small" style={{ marginTop: 4 }}>
          Compare LLM responses from OpenAI and Gemini — all logged to Neon.
        </p>
      </div>

      <div className="card stack">
        <nav className="tabs">
          <button className={`tab${tab === "single" ? " active" : ""}`} onClick={() => setTab("single")}>
            Single Query
          </button>
          <button className={`tab${tab === "compare" ? " active" : ""}`} onClick={() => setTab("compare")}>
            Compare
          </button>
          <button className={`tab${tab === "history" ? " active" : ""}`} onClick={() => setTab("history")}>
            History
          </button>
        </nav>

        {/* ── Single Query ── */}
        {tab === "single" && (
          <div className="stack">
            <form className="stack" onSubmit={onSingleSubmit}>
              <label className="stack">
                <span className="small">Prompt</span>
                <textarea
                  rows={5}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask a question..."
                  required
                />
              </label>

              <div className="row">
                <label className="stack" style={{ flex: 1 }}>
                  <span className="small">Provider</span>
                  <select value={provider} onChange={(e) => setProvider(e.target.value as "openai" | "gemini")}>
                    <option value="openai">OpenAI</option>
                    <option value="gemini">Gemini</option>
                  </select>
                </label>
                <label className="stack" style={{ flex: 2 }}>
                  <span className="small">Model (optional)</span>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder={provider === "openai" ? "gpt-4.1-mini" : "gemini-2.0-flash"}
                  />
                </label>
              </div>

              <button className="btn-primary" type="submit" disabled={loading || !prompt.trim()}>
                {loading ? "Sending..." : "Run Query"}
              </button>
            </form>

            {error && <p style={{ color: "#b91c1c", margin: 0 }}>{error}</p>}

            {latestResponse && (
              <div className="stack">
                <h3>Response</h3>
                <p className="response-box">{latestResponse}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Compare ── */}
        {tab === "compare" && (
          <div className="stack">
            <form className="stack" onSubmit={onCompareSubmit}>
              <label className="stack">
                <span className="small">Prompt</span>
                <textarea
                  rows={5}
                  value={cmpPrompt}
                  onChange={(e) => setCmpPrompt(e.target.value)}
                  placeholder="Ask something to compare both providers..."
                  required
                />
              </label>

              <div className="cols-2">
                <label className="stack">
                  <span className="small">OpenAI model (optional)</span>
                  <input type="text" value={cmpOpenaiModel} onChange={(e) => setCmpOpenaiModel(e.target.value)} placeholder="gpt-4.1-mini" />
                </label>
                <label className="stack">
                  <span className="small">Gemini model (optional)</span>
                  <input type="text" value={cmpGeminiModel} onChange={(e) => setCmpGeminiModel(e.target.value)} placeholder="gemini-2.0-flash" />
                </label>
              </div>

              <button className="btn-primary" type="submit" disabled={cmpLoading || !cmpPrompt.trim()}>
                {cmpLoading ? "Comparing..." : "Compare Both"}
              </button>
            </form>

            {cmpError && <p style={{ color: "#b91c1c", margin: 0 }}>{cmpError}</p>}

            {cmpResults && (
              <div className="cols-2">
                <div className="stack">
                  <span className="badge badge-openai">OpenAI</span>
                  {"error" in cmpResults.openai! ? (
                    <p style={{ color: "#b91c1c", margin: 0 }}>{(cmpResults.openai as { error: string }).error}</p>
                  ) : (
                    <>
                      <p className="small">{(cmpResults.openai as { model: string }).model}</p>
                      <p className="response-box">{(cmpResults.openai as { text: string }).text}</p>
                    </>
                  )}
                </div>
                <div className="stack">
                  <span className="badge badge-gemini">Gemini</span>
                  {"error" in cmpResults.gemini! ? (
                    <p style={{ color: "#b91c1c", margin: 0 }}>{(cmpResults.gemini as { error: string }).error}</p>
                  ) : (
                    <>
                      <p className="small">{(cmpResults.gemini as { model: string }).model}</p>
                      <p className="response-box">{(cmpResults.gemini as { text: string }).text}</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── History ── */}
        {tab === "history" && (
          <div className="stack">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="small">{items.length} query log{items.length !== 1 ? "s" : ""}</span>
              <a href="/api/queries/export" download>
                <button className="btn-secondary" type="button">Export CSV</button>
              </a>
            </div>

            {histError && <p style={{ color: "#b91c1c", margin: 0 }}>{histError}</p>}

            {items.length === 0 ? (
              <p className="small">No queries yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Provider</th>
                    <th>Model</th>
                    <th>Prompt</th>
                    <th>Response</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="small" style={{ whiteSpace: "nowrap" }}>{new Date(item.createdAt).toLocaleString()}</td>
                      <td>
                        <span className={`badge badge-${item.provider}`}>{item.provider}</span>
                      </td>
                      <td className="small">{item.model}</td>
                      <td>{item.prompt}</td>
                      <td>{item.response.slice(0, 200)}{item.response.length > 200 ? "\u2026" : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
