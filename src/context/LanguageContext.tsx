import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { translations, type Lang, type Translation } from "../game/translations";

interface LanguageContextValue {
  lang: Lang;
  t: Translation;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const value: LanguageContextValue = {
    lang,
    t: translations[lang],
    setLang: useCallback((l: Lang) => setLang(l), []),
  };
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
