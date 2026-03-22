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

type HealthState = {
  status: "ok" | "degraded";
  database: "connected" | "disconnected";
  providers: {
    openai: boolean;
    gemini: boolean;
  };
  timestamp: string;
  latencyMs: number;
  error?: string;
};

type Tab = "single" | "compare" | "history";

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("single");

  const [health, setHealth] = useState<HealthState | null>(null);
  const [healthError, setHealthError] = useState("");

  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState<"openai" | "gemini">("openai");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [latestResponse, setLatestResponse] = useState("");

  const [cmpPrompt, setCmpPrompt] = useState("");
  const [cmpOpenaiModel, setCmpOpenaiModel] = useState("");
  const [cmpGeminiModel, setCmpGeminiModel] = useState("");
  const [cmpLoading, setCmpLoading] = useState(false);
  const [cmpError, setCmpError] = useState("");
  const [cmpResults, setCmpResults] = useState<{ openai?: CompareResult; gemini?: CompareResult } | null>(null);

  const [items, setItems] = useState<QueryItem[]>([]);
  const [histError, setHistError] = useState("");

  async function loadHistory() {
    const res = await fetch("/api/queries");
    const data = await res.json();
    setItems(data.items ?? []);
  }

  async function loadHealth() {
    setHealthError("");
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const data = await res.json();
      setHealth(data);
      if (!res.ok) {
        setHealthError(data?.error || "Healthcheck reported an issue");
      }
    } catch (err) {
      setHealth(null);
      setHealthError(err instanceof Error ? err.message : "Could not load health status");
    }
  }

  useEffect(() => {
    loadHistory().catch((err) => setHistError(err?.message || "Could not load history"));
    loadHealth().catch(() => undefined);
  }, []);

  async function refreshData() {
    await Promise.allSettled([loadHistory(), loadHealth()]);
  }

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
      await refreshData();
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
      await refreshData();
    } catch (err) {
      setCmpError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setCmpLoading(false);
    }
  }

  return (
    <main className="stack">
      <div className="stack">
        <div>
          <h1>Answer Engine Tracker</h1>
          <p className="small" style={{ marginTop: 4 }}>
            Compare LLM responses from OpenAI and Gemini and log everything to Neon.
          </p>
        </div>

        <section className="status-grid">
          <div className="card stack">
            <div className="row space-between">
              <h2>Runtime Status</h2>
              <button className="btn-secondary" type="button" onClick={() => loadHealth()}>
                Refresh
              </button>
            </div>
            <div className="status-list">
              <div className="status-item">
                <span>App</span>
                <span className={`badge ${health?.status === "ok" ? "badge-openai" : "badge-error"}`}>
                  {health?.status ?? "unknown"}
                </span>
              </div>
              <div className="status-item">
                <span>Database</span>
                <span className={`badge ${health?.database === "connected" ? "badge-openai" : "badge-error"}`}>
                  {health?.database ?? "unknown"}
                </span>
              </div>
              <div className="status-item">
                <span>OpenAI</span>
                <span className={`badge ${health?.providers.openai ? "badge-openai" : "badge-error"}`}>
                  {health?.providers.openai ? "configured" : "missing"}
                </span>
              </div>
              <div className="status-item">
                <span>Gemini</span>
                <span className={`badge ${health?.providers.gemini ? "badge-gemini" : "badge-error"}`}>
                  {health?.providers.gemini ? "configured" : "missing"}
                </span>
              </div>
            </div>
            <p className="small">{health ? `Last checked ${new Date(health.timestamp).toLocaleString()} (${health.latencyMs} ms)` : "Healthcheck not loaded yet."}</p>
            {healthError && <p style={{ color: "#b91c1c", margin: 0 }}>{healthError}</p>}
          </div>

          <div className="card stack">
            <h2>Setup Checklist</h2>
            <div className="status-list">
              <div className="status-item">
                <span>DATABASE_URL</span>
                <span className={`badge ${health?.database === "connected" ? "badge-openai" : "badge-error"}`}>
                  {health?.database === "connected" ? "ready" : "check value"}
                </span>
              </div>
              <div className="status-item">
                <span>DIRECT_URL</span>
                <span className="badge badge-gemini">required for Prisma</span>
              </div>
              <div className="status-item">
                <span>OPENAI_API_KEY</span>
                <span className={`badge ${health?.providers.openai ? "badge-openai" : "badge-error"}`}>
                  {health?.providers.openai ? "ready" : "missing"}
                </span>
              </div>
              <div className="status-item">
                <span>GEMINI_API_KEY</span>
                <span className={`badge ${health?.providers.gemini ? "badge-gemini" : "badge-error"}`}>
                  {health?.providers.gemini ? "ready" : "missing"}
                </span>
              </div>
            </div>
            <p className="small">Do not paste secrets into chat. Put them only in your local `.env` and Vercel environment settings.</p>
          </div>
        </section>
      </div>

      <div className="card stack">
        <nav className="tabs">
          <button className={`tab${tab === "single" ? " active" : ""}`} type="button" onClick={() => setTab("single")}>
            Single Query
          </button>
          <button className={`tab${tab === "compare" ? " active" : ""}`} type="button" onClick={() => setTab("compare")}>
            Compare
          </button>
          <button className={`tab${tab === "history" ? " active" : ""}`} type="button" onClick={() => setTab("history")}>
            History
          </button>
        </nav>

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

              <div className="row wrap-on-mobile">
                <label className="stack field-flex-1">
                  <span className="small">Provider</span>
                  <select value={provider} onChange={(e) => setProvider(e.target.value as "openai" | "gemini")}>
                    <option value="openai">OpenAI</option>
                    <option value="gemini">Gemini</option>
                  </select>
                </label>
                <label className="stack field-flex-2">
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

              <div className="cols-2 responsive-1col">
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
              <div className="cols-2 responsive-1col">
                <div className="stack">
                  <span className="badge badge-openai">OpenAI</span>
                  {cmpResults.openai && "error" in cmpResults.openai ? (
                    <p style={{ color: "#b91c1c", margin: 0 }}>{cmpResults.openai.error}</p>
                  ) : cmpResults.openai ? (
                    <>
                      <p className="small">{cmpResults.openai.model}</p>
                      <p className="response-box">{cmpResults.openai.text}</p>
                    </>
                  ) : null}
                </div>
                <div className="stack">
                  <span className="badge badge-gemini">Gemini</span>
                  {cmpResults.gemini && "error" in cmpResults.gemini ? (
                    <p style={{ color: "#b91c1c", margin: 0 }}>{cmpResults.gemini.error}</p>
                  ) : cmpResults.gemini ? (
                    <>
                      <p className="small">{cmpResults.gemini.model}</p>
                      <p className="response-box">{cmpResults.gemini.text}</p>
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "history" && (
          <div className="stack">
            <div className="row space-between wrap-on-mobile">
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
                      <td>{item.response.slice(0, 200)}{item.response.length > 200 ? "..." : ""}</td>
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
