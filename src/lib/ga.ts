declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;

export function pageView(path: string) {
  if (!GA_ID || !window.gtag) return;
  window.gtag("event", "page_view", { page_path: path });
}

export function gaEvent(name: string, params?: Record<string, any>) {
  if (!GA_ID || !window.gtag) return;
  window.gtag("event", name, params ?? {});
}