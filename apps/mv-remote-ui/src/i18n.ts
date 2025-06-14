import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en";
import zhCN from "./locales/zh-CN";
import zhTW from "./locales/zh-TW.ts";

export const resources = {
    en: { translation: en },
    "zh-CN": { translation: zhCN },
    "zh-TW": { translation: zhTW },
};

function handleLanguageChange(lng: string) {
    switch (lng) {
        case "zh-CN":
            document.documentElement.lang = "zh-hans-CN";
            break;
        case "zh-TW":
            document.documentElement.lang = "zh-hant-TW";
            break;
        default:
            document.documentElement.lang = "en";
    }
}

i18n.on("initialized", () => {
    handleLanguageChange(i18n.language);
});

i18n.on("languageChanged", lng => {
    handleLanguageChange(lng);
});

i18n.use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false, // react 已经防止 XSS
        },
        debug: true,
    });

export default i18n;
