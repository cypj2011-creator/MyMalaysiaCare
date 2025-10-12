import { useState, useEffect } from "react";
import { translations, Language, TranslationKey } from "@/translations";

export const useTranslation = () => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("lang");
    return (saved === "en" || saved === "zh" || saved === "ms" ? saved : "en") as Language;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("lang");
      if (saved === "en" || saved === "zh" || saved === "ms") {
        setLang(saved as Language);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("languageChange", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("languageChange", handleStorageChange);
    };
  }, []);

  const t = (key: TranslationKey): string => {
    return translations[lang][key] || translations.en[key] || key;
  };

  return { t, lang };
};
