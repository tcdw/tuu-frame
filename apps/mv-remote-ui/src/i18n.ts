import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import zhCN from "./locales/zh-CN";
import zhTW from "./locales/zh-TW.ts";

export const resources = {
    en: { translation: en },
    "zh-CN": { translation: zhCN },
    "zh-TW": { translation: zhTW },
};

i18n.use(initReactI18next).init({
    resources,
    lng: localStorage.getItem("language") || "zh-CN", // 从 localStorage 获取语言设置，否则默认为 "zh-CN"
    fallbackLng: "en",
    interpolation: {
        escapeValue: false, // react 已经防止 XSS
    },
    debug: true,
    detection: {
        caches: ["localStorage"], // 使用 localStorage 来存储语言设置
    },
});

i18n.on("languageChanged", lng => {
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
});

export default i18n;
