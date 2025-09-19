async function parseError(res) {
  try {
    const data = await res.json();
    if (data?.errors) {
      // ASP.NET ModelState errors (Dictionary<string, string[]>)
      const flat = Object.entries(data.errors).flatMap(([key, arr]) =>
        (arr || []).map((msg) => `${key}: ${msg}`)
      );
      return flat.join("; ");
    }
    if (data?.title || data?.detail) {
      return data.detail || data.title;
    }
    return JSON.stringify(data);
  } catch {
    const text = await res.text().catch(() => "");
    return text || `${res.status} ${res.statusText}`;
  }
}

export async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const message = await parseError(res);
    const error = new Error(message || `HTTP ${res.status}`);
    error.status = res.status;
    error.response = res;
    throw error;
  }

  return res;
}
