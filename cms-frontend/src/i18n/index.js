import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../locales/en/common.json";
import de from "../locales/de/common.json";
import fr from "../locales/fr/common.json";
import fa from "../locales/fa/common.json";
import it from "../locales/it/common.json"; // 🇮🇹 جدید

const savedLanguage = localStorage.getItem("language");

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "de", "fr", "fa", "it"],
    resources: {
      en: { common: en },
      de: { common: de },
      fr: { common: fr },
      fa: { common: fa },
      it: { common: it },
    },
    ns: ["common"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    detection: {
      order: ["querystring", "localStorage", "navigator", "cookie", "htmlTag"],
      caches: ["localStorage"],
    },
    lng: savedLanguage || "en",
  });

export default i18n;
