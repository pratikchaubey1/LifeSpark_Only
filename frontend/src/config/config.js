// Centralized frontend configuration.
//
// Set VITE_API_URL in `frontend/.env` (or your deployment env) to point to the backend.

function normalizeBaseUrl(url) {
  if (!url) return "";
  return String(url).replace(/\/+$/, "");
}

const config = {
  apiUrl: normalizeBaseUrl(import.meta.env.VITE_API_URL),
};

export default config;
