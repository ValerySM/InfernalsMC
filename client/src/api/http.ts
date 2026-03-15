export type ApiError = {
  code?: string;
  message?: string;
};

export class HttpError extends Error {
  status: number;
  payload?: any;

  constructor(status: number, message: string, payload?: any) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function readJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function fetchJson<T>(
  url: string,
  opts?: RequestInit & { withCredentials?: boolean }
): Promise<T> {
  const withCredentials = opts?.withCredentials ?? false;

  const res = await fetch(url, {
    ...opts,
    credentials: withCredentials ? "include" : opts?.credentials,
    headers: {
      "Content-Type": "application/json",
      ...(opts?.headers || {}),
    },
  });

  if (!res.ok) {
    const payload = await readJsonSafe(res);
    const msg =
      (payload && typeof payload === "object" && payload?.error?.message) ||
      res.statusText ||
      "Request failed";
    throw new HttpError(res.status, msg, payload);
  }
  const payload = (await readJsonSafe(res)) as any;
  return payload as T;
}

export async function postForm<T>(
  url: string,
  form: FormData,
  opts?: { withCredentials?: boolean }
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    body: form,
    credentials: opts?.withCredentials ? "include" : undefined,
  });

  if (!res.ok) {
    const payload = await readJsonSafe(res);
    const msg =
      (payload && typeof payload === "object" && payload?.error?.message) ||
      res.statusText ||
      "Upload failed";
    throw new HttpError(res.status, msg, payload);
  }
  const payload = (await readJsonSafe(res)) as any;
  return payload as T;
}
