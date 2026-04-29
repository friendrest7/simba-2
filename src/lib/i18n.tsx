import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import rw from "@/locales/rw.json";
import sw from "@/locales/sw.json";
import tr from "@/locales/tr.json";

export type Lang = "en" | "fr" | "rw" | "sw" | "tr";

type Dict = Record<string, string>;

const dictionaries: Record<Lang, Dict> = {
  en,
  fr,
  rw,
  sw,
  tr,
};

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "EN" },
  { code: "rw", label: "Kinyarwanda", flag: "RW" },
  { code: "fr", label: "Francais", flag: "FR" },
  { code: "sw", label: "Kiswahili", flag: "SW" },
  { code: "tr", label: "Turkce", flag: "TR" },
];

export const translate = (lang: Lang, key: string) =>
  dictionaries[lang]?.[key] ?? dictionaries.en[key] ?? key;

type I18nCtx = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
};

const Ctx = createContext<I18nCtx | null>(null);

function normalizeLang(value: string | null | undefined): Lang {
  return value === "fr" || value === "rw" || value === "sw" || value === "tr" ? value : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setLangState(normalizeLang(window.localStorage.getItem("simba.lang")));
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (nextLang: Lang) => {
    setLangState(nextLang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("simba.lang", nextLang);
    }
  };

  const value = useMemo<I18nCtx>(
    () => ({
      lang,
      setLang,
      t: (key: string) => translate(lang, key),
    }),
    [lang],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => {
  const context = useContext(Ctx);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
};
