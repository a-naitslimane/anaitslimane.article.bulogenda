import { $, $$, esc } from "./dom.js";
import { fr } from "./locales/fr.js";
import { en } from "./locales/en.js";

const DICT = { fr, en };
let currentLang = localStorage.getItem("bulogenda_lang") || "fr";

export const getLang = () => currentLang;

export const t = (key, params = {}) => {
    let str = (DICT[currentLang] && DICT[currentLang][key]) || DICT.fr[key] || key;
    for (const [k, v] of Object.entries(params)) {
        str = str.replace(`{${k}}`, v);
    }
    return str;
};

export const trVal = (prefix, val) => (val ? t(`${prefix}.${val}`) : "");

export const opts = (list, prefix = "") => list.map((x) => `<option value="${esc(x)}">${x ? esc(prefix ? t(`${prefix}.${x}`) : x) : ""}</option>`).join("");

export function applyStaticTranslations() {
    document.documentElement.lang = currentLang;
    $$("[data-i18n]").forEach((el) => {
        el.textContent = t(el.dataset.i18n);
    });
    $$("[data-i18n-ph]").forEach((el) => {
        el.placeholder = t(el.dataset.i18nPh);
    });
    $$("[data-i18n-title]").forEach((el) => {
        el.title = t(el.dataset.i18nTitle);
    });
    const langBtn = $("#lang-toggle");
    if (langBtn) {
        langBtn.textContent = currentLang === "fr" ? "EN" : "FR";
        langBtn.title = currentLang === "fr" ? "Switch to English" : "Passer en français";
    }
}

export function toggleLang(onChangeCallback) {
    currentLang = currentLang === "fr" ? "en" : "fr";
    localStorage.setItem("bulogenda_lang", currentLang);
    applyStaticTranslations();
    if (onChangeCallback) onChangeCallback();
}
