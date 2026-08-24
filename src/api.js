const BASE = "/api";

function getToken() {
  return localStorage.getItem("shd_token");
}

async function request(path, { method = "GET", body, isBlob = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(message);
  }

  if (isBlob) return res.blob();
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  del: (path) => request(path, { method: "DELETE" }),
  blob: (path) => request(path, { isBlob: true }),
};

/** Opens a PDF returned by the backend in a new browser tab for viewing/printing. */
export async function openPdf(path) {
  const blob = await api.blob(path);
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
}

export { getToken };
