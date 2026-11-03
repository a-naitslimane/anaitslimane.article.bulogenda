export const $ = (s) => document.querySelector(s);
export const $$ = (s) => document.querySelectorAll(s);

export const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const url = (l) => (/^https?:\/\//i.test(l) ? l : `https://${l}`);

export const setOptions = (selector, html) => {
    const el = $(selector);
    if (el) el.innerHTML = html;
};
