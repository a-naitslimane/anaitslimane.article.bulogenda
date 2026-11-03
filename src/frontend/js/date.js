import { t } from "./i18n.js";

export const today = () => new Date().toLocaleDateString("sv");

export const nowLocalISO = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
};

export const addDays = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toLocaleDateString("sv");
};

export const fmt = (d) => (d ? d.split("-").reverse().join("/") : "");

export const fmtDateTime = (dt) => {
    if (!dt) return "";
    const [datePart, timePart] = dt.split("T");
    const d = fmt(datePart);
    return timePart ? `${d} ${timePart.slice(0, 5)}` : d;
};

export const daysFrom = (d) => Math.round((Date.parse(today()) - Date.parse(d)) / 864e5);

export const ago = (d) => {
    const n = daysFrom(d);
    return n <= 0 ? t("time.today") : n === 1 ? t("time.yesterday") : t("time.days_ago", { n });
};

export const dueLabel = (d) => {
    const n = daysFrom(d);
    return n > 0 ? t("due.late", { d: fmt(d) }) : n === 0 ? t("due.today") : n === -1 ? t("due.tomorrow") : fmt(d);
};
