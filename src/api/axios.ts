// src/api/axios.ts
import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from "axios";
import { log } from "node:console";

const BASE_URL = import.meta.env.VITE_API_BASE_URL
if (!BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not set");
}

// ---- CSRF管理（メモリ + Cookieフォールバック） ----
let csrfToken: string | null = null;
export const setCsrfToken = (v: string | null) => {
  csrfToken = v;
};

const getCookie = (name: string) => {
  // 例: "csrf_token=abc; other=..." から値を取得（URLエンコード考慮）

  const raw =
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1] ?? null;
  return raw ? decodeURIComponent(raw) : null;
};

// ---- axios instance ----
const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Cookie送受信 必須
});

// ---- Request: 非GETに X-CSRF-Token を必ず付与 ----
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = (config.method ?? "get").toUpperCase();
  const needsCsrf = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  if (needsCsrf) {
    const token = csrfToken ?? getCookie("csrf_token");
    if (token) {
      const headers =
        (config.headers as AxiosHeaders | undefined) ?? new AxiosHeaders();
      headers.set("X-CSRF-Token", token);
      config.headers = headers;
    }
  }
  return config;
});

// ---- Response: 401時は1回だけ refresh → リトライ ----
let refreshing = false;
let queue: Array<() => void> = [];
const flushQueue = () => {
  queue.forEach((fn) => fn());
  queue = [];
};

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;
    const status = error.response?.status;
    const url = (original?.url ?? "").toString();
    const isRefreshCall = url.includes("/auth/refresh");

    if (status === 401 && original && !original._retried && !isRefreshCall) {
      original._retried = true;

      if (refreshing) {
        await new Promise<void>((resolve) => queue.push(resolve));
      } else {
        try {
          refreshing = true;
          // Cookieのrefresh_tokenを使って再発行
          const r = await apiClient.post("/auth/refresh");
          const newCsrf = (r.data as { csrf_token?: string })?.csrf_token ?? getCookie("csrf_token");
          setCsrfToken(newCsrf ?? null);
        } catch {
          // 失敗：キュー解放してエラー返却
          flushQueue();
          refreshing = false;
          return Promise.reject(error);
        } finally {
          refreshing = false;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
