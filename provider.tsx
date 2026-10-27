import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Language } from "./index";

const LANGUAGE_KEY = "afgledger:language:v1";
type LanguageContextValue = { language: Language; setLanguage: (language: Language) => Promise<void> };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fa");
  useEffect(() => { AsyncStorage.getItem(LANGUAGE_KEY).then((value) => { if (value === "fa" || value === "ps") setLanguageState(value); }); }, []);
  const setLanguage = async (next: Language) => { setLanguageState(next); await AsyncStorage.setItem(LANGUAGE_KEY, next); };
  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
