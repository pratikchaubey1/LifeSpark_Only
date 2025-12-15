import { useState } from "react";

import config from "../../config/config";

// Simple reusable hook for calling the backend /api/test endpoint.
// You can use this inside any component where the user "gives the test".
export function useAiTest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function runTest(answers) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${config.apiUrl}/api/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(
          data?.error ||
            "Something went wrong while checking your test. Please try again."
        );
        return;
      }

      setResult(data.result);
    } catch (e) {
      setError("Network error. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, result, runTest };
}
