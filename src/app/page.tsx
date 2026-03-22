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

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState<"openai" | "gemini">("openai");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [latestResponse, setLatestResponse] = useState("");
  const [items, setItems] = useState<QueryItem[]>([]);

  async function loadHistory() {
    const response = await fetch("/api/queries");
    const data = await response.json();
    setItems(data.items ?? []);
  }

  useEffect(() => {
    loadHistory().catch((err) => setError(err?.message || "Could not load history"));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt,
          provider,
          model: model || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Request failed");
      }

      setLatestResponse(data.response);
      setPrompt("");
      await loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="stack">
      <div className="stack">
        <h1>Answer Engine Tracker</h1>
        <p className="small">
          MVP dashboard for sending prompts through OpenAI/Gemini and storing responses in Neon via Prisma.
        </p>
      </div>

      <section className="card stack">
        <h2>New Query</h2>
        <form className="stack" onSubmit={onSubmit}>
          <label className="stack">
            <span className="small">Prompt</span>
            <textarea
              rows={6}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask a question..."
              required
            />
          </label>

          <div className="row">
            <label className="stack" style={{ flex: 1 }}>
              <span className="small">Provider</span>
              <select value={provider} onChange={(event) => setProvider(event.target.value as "openai" | "gemini")}>
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
              </select>
            </label>

            <label className="stack" style={{ flex: 2 }}>
              <span className="small">Model (optional override)</span>
              <input
                style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 10 }}
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder={provider === "openai" ? "gpt-4.1-mini" : "gemini-2.0-flash"}
              />
            </label>
          </div>

          <button type="submit" disabled={loading || !prompt.trim()}>
            {loading ? "Sending..." : "Run Query"}
          </button>
        </form>

        {error && <p style={{ color: "#b91c1c", margin: 0 }}>{error}</p>}

        {latestResponse && (
          <div className="card stack">
            <h3>Latest Response</h3>
            <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{latestResponse}</p>
          </div>
        )}
      </section>

      <section className="card stack">
        <h2>Recent Queries</h2>
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
                  <td className="small">{new Date(item.createdAt).toLocaleString()}</td>
                  <td>{item.provider}</td>
                  <td>{item.model}</td>
                  <td>{item.prompt}</td>
                  <td>{item.response.slice(0, 240)}{item.response.length > 240 ? "…" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
