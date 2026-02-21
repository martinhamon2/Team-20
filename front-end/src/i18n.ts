import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import nl from "./public/locales/nl/common.json";
import en from "./public/locales/en/common.json";

i18n.use(initReactI18next).init({
  lng: "nl",
  fallbackLng: "en",
  ns: ["common", "registratie"],
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      common: en,
    },
    nl: {
      common: nl,
    },
  },
});

export default i18n;
