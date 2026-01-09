// src/components/common/LanguageSwitchers.tsx
import * as React from "react";

export type LangCode = "ja" | "en" | "zh-TW";

export const LANGS: { code: LangCode; label: string }[] = [
    { code: "ja", label: "日本語" },
    { code: "en", label: "English" },
    { code: "zh-TW", label: "繁体字" },
];

export const STORAGE_KEY = "al_lang";

export default function LanguageSwitchers() {
    return (
        <div id="al-lang-switchers" className="sr-only al-languages" aria-hidden="true">
            {LANGS.map((x) => (
                <button key={x.code} type="button" className="al-switch" data-lang={x.code}>
                    {x.label}
                </button>
            ))}
        </div>
    );
}
