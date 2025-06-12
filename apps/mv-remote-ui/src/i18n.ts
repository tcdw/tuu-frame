import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import zh from "./locales/zh";

export const resources = {
    en: { translation: en },
    zh: { translation: zh },
};

i18n.use(initReactI18next).init({
    resources,
    lng: "zh", // 默认语言
    fallbackLng: "en",
    interpolation: {
        escapeValue: false, // react 已经防止 XSS
    },
    // debug: true,
});

export default i18n;
