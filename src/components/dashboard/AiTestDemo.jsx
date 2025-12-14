import React, { useState } from "react";
import { useAiTest } from "./useAiTest";

export default function AiTestDemo() {
  const [text, setText] = useState("");
  const { loading, error, result, runTest } = useAiTest();

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;

    // here we treat the text as "answers"; adjust as per your real test data
    runTest({ freeText: text.trim() });
  }

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded-xl shadow border border-slate-200">
      <h2 className="text-lg font-semibold mb-2">AI Test Demo</h2>
      <p className="text-xs text-slate-500 mb-3">
        Type your answer below and click "Evaluate". The backend uses Gemini and
        handles overload (503) errors gracefully.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Write your test answer here..."
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white disabled:opacity-60"
        >
          {loading ? "Evaluating..." : "Evaluate"}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-3 text-sm bg-slate-50 border border-slate-200 rounded-md px-3 py-2 space-y-1">
          {typeof result.score === "number" && (
            <p>
              <span className="font-semibold">Score:</span> {result.score}
            </p>
          )}
          {result.feedback && (
            <p>
              <span className="font-semibold">Feedback:</span> {result.feedback}
            </p>
          )}
          {!result.score && !result.feedback && (
            <pre className="text-xs whitespace-pre-wrap break-words">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
