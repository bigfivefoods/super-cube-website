"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getLocaleFromStorage,
  setLocaleInStorage,
  t as translate,
  type I18nKey,
  type Locale,
} from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: I18nKey, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  // Default English on server + first paint; hydrate from storage
  const [locale, setLocaleState] = useState<Locale>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getLocaleFromStorage();
    setLocaleState(stored);
    document.documentElement.lang =
      stored === "en" ? "en" : stored === "zu" ? "zu" : "af";
    setReady(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    setLocaleInStorage(next);
  }, []);

  const t = useCallback(
    (key: I18nKey, vars?: Record<string, string | number>) =>
      translate(key, locale, vars),
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  // Avoid flash of wrong language for chrome by still rendering (EN default)
  return (
    <LocaleContext.Provider value={value}>
      <div data-locale={locale} data-locale-ready={ready ? "1" : "0"}>
        {children}
      </div>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: "en" as Locale,
      setLocale: (_: Locale) => {},
      t: (key: I18nKey, vars?: Record<string, string | number>) =>
        translate(key, "en", vars),
    };
  }
  return ctx;
}
