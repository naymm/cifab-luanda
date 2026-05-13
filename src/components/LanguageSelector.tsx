import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../i18n";
import { useTheme } from "../theme/ThemeContext";

export function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const { C } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language.split("-")[0]) ??
    SUPPORTED_LANGUAGES[1];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("header.languageAria")}
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "transparent",
          color: C.text,
          border: `1px solid ${C.border}`,
          borderRadius: 5,
          padding: "5px 10px",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          transition: "all 0.15s",
        }}
      >
        <span style={{ fontSize: 14, lineHeight: 1 }}>{current.flag}</span>
        <span>{current.code.toUpperCase()}</span>
        <span
          style={{
            fontSize: 9,
            color: C.sub,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s",
          }}
        >
          ▼
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            padding: 4,
            margin: 0,
            listStyle: "none",
            minWidth: 150,
            zIndex: 50,
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const active = lang.code === current.code;
            return (
              <li key={lang.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setOpen(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: active ? `${C.gold}22` : "transparent",
                    color: active ? C.gold : C.text,
                    border: "none",
                    borderRadius: 4,
                    padding: "8px 10px",
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = C.light;
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ fontSize: 16, lineHeight: 1 }}>{lang.flag}</span>
                  <span style={{ flex: 1 }}>{lang.label}</span>
                  {active && <span style={{ fontSize: 11 }}>✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
