import * as React from "react";
import { Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { LANGS, STORAGE_KEY, type LangCode } from "./LanguageSwitchers";

function resetHorizontalScroll() {
    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
    window.scrollTo({ left: 0, top: window.scrollY, behavior: "auto" });
}

function applyLang(next: LangCode) {
    localStorage.setItem(STORAGE_KEY, next);

    const btn = document.querySelector(
        `#al-lang-switchers .al-switch[data-lang="${next}"]`
    ) as HTMLButtonElement | null;

    btn?.click();

    requestAnimationFrame(resetHorizontalScroll);
    setTimeout(resetHorizontalScroll, 50);
    setTimeout(resetHorizontalScroll, 200);
}

export default function LanguageSelect() {
    const [lang, setLang] = React.useState<LangCode>("ja");

    React.useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === "ja" || saved === "en" || saved === "zh-TW") setLang(saved);
    }, []);

    const switchLang = (next: LangCode) => {
        setLang(next);
        applyLang(next);
    };

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Language"
                    translate="no"
                    className={cn(
                        "h-9 w-9 p-0 shrink-0",
                        "border-0 shadow-none outline-none focus:outline-none",
                        "focus-visible:ring-0 focus-visible:ring-offset-0",
                        "data-[state=open]:bg-transparent",
                        "text-foreground hover:text-foreground",
                        "[&_svg]:stroke-current [&_svg]:opacity-100"
                    )}
                >
                    <Globe className="h-5 w-5 shrink-0" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="al-languages w-44 sm:w-56 max-w-[calc(100vw-16px)] p-1"
                align="end"
                side="bottom"
                sideOffset={8}
                collisionPadding={8}
                translate="no"
            >
                {LANGS.map((x) => {
                    const active = x.code === lang;
                    return (
                        <DropdownMenuItem
                            key={x.code}
                            onSelect={() => switchLang(x.code)}
                            className={cn(
                                "flex items-center gap-3 py-3 cursor-pointer select-none",
                                active && "bg-muted"
                            )}
                        >
                            <span className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                                {active && <span className="h-3 w-3 rounded-full bg-primary" />}
                            </span>
                            <span className="text-base">{x.label}</span>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
