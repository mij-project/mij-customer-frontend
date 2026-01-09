import * as React from "react";
import type { LangCode } from "@/components/common/LanguageSwitchers";
import { STORAGE_KEY } from "@/components/common/LanguageSwitchers";

function resetHorizontalScroll() {
    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
    window.scrollTo({ left: 0, top: window.scrollY, behavior: "auto" });
}

function isUtcPlus9() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Tokyo";
}

function findSwitcher(next: LangCode) {
    return document.querySelector(
        `#al-lang-switchers .al-switch[data-lang="${next}"]`
    ) as HTMLButtonElement | null;
}

function fireClick(el: HTMLButtonElement) {
    el.click();
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
}

function applyLang(next: LangCode) {
    const btn = findSwitcher(next);
    if (!btn) return false;

    fireClick(btn);

    requestAnimationFrame(resetHorizontalScroll);
    setTimeout(resetHorizontalScroll, 50);
    setTimeout(resetHorizontalScroll, 200);

    return true;
}

function loadAutolingualScript(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[data-autolingual-id="${id}"]`) as
            | HTMLScriptElement
            | null;

        if (existing) {
            resolve();
            return;
        }

        const s = document.createElement("script");
        s.async = true;
        s.src = `https://cdn.autolingual.io/autolingualjs/v1.0.0/autolingual.js?id=${encodeURIComponent(id)}`;
        s.setAttribute("data-autolingual-id", id);

        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load autolingual script"));

        document.head.appendChild(s);
    });
}

export default function LanguageAutoTimezone({
    children,
}: {
    children: React.ReactNode;
}) {
    const ranRef = React.useRef(false);

    React.useEffect(() => {
        if (ranRef.current) return;
        ranRef.current = true;

        const autolingualId = import.meta.env.VITE_AUTOLINGUAL_ID as string | undefined;

        const saved = localStorage.getItem(STORAGE_KEY);

        const desired: LangCode =
            saved === "ja" || saved === "en" || saved === "zh-TW" ? saved : isUtcPlus9() ? "ja" : "en";

        if (!(saved === "ja" || saved === "en" || saved === "zh-TW")) {
            localStorage.setItem(STORAGE_KEY, desired);
        }

        const waitSwitchers = () =>
            new Promise<void>((resolve) => {
                const ok = !!document.querySelector("#al-lang-switchers .al-switch");
                if (ok) return resolve();

                const obs = new MutationObserver(() => {
                    const ok2 = !!document.querySelector("#al-lang-switchers .al-switch");
                    if (!ok2) return;
                    obs.disconnect();
                    resolve();
                });
                obs.observe(document.documentElement, { childList: true, subtree: true });

                setTimeout(() => {
                    obs.disconnect();
                    resolve();
                }, 2000);
            });

        (async () => {
            await waitSwitchers();

            if (autolingualId) {
                try {
                    await loadAutolingualScript(autolingualId);
                } catch {
                    console.error("Failed to load autolingual script");
                }
            }

            const delays = [0, 50, 200, 500, 1000, 1500, 2500];
            delays.forEach((d) => {
                window.setTimeout(() => applyLang(desired), d);
            });
            const onLoad = () => applyLang(desired);
            window.addEventListener("load", onLoad, { once: true });
        })();
    }, []);

    return <>{children}</>;
}
