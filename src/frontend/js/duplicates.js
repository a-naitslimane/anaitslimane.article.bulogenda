import { ICONS } from "./constants.js";
import { $, esc } from "./dom.js";
import { t } from "./i18n.js";
import { state, cur, norm } from "./store.js";

export function findMatches(scope, payload, excludeId = null) {
    const exact = [];
    const cross = [];

    if (scope === "contacts") {
        const nName = norm(payload.name);
        const nComp = norm(payload.company);
        if (!nName) return { exact, cross };

        for (const c of state.data.contacts) {
            if (excludeId && c.id === excludeId) continue;
            if (norm(c.name) === nName && norm(c.company) === nComp) {
                exact.push({ scope: "contacts", item: c, label: t("nav.contacts") });
            } else if (norm(c.name) === nName) {
                cross.push({ scope: "contacts", item: c, label: t("dup.homonym") });
            }
        }
        return { exact, cross };
    }

    const nComp = norm(payload.company);
    const nPos = norm(payload.position);
    if (!nComp) return { exact, cross };

    for (const item of state.data.opps) {
        if (excludeId && item.id === excludeId) continue;
        const sameComp = norm(item.company) === nComp;
        const samePos = norm(item.position) === nPos;

        if (sameComp && samePos) {
            exact.push({ scope: "opps", item, label: t("nav.opps") });
        } else if (sameComp) {
            cross.push({
                scope: "opps",
                item,
                label: `${t("dup.same_comp")} (${item.position || t("dup.no_title")})`,
            });
        }
    }

    return { exact, cross };
}

export function renderDuplicateBadge(o) {
    const matches = findMatches(state.view, o, o.id);
    const totalMatches = matches.exact.length + matches.cross.length;
    if (!totalMatches) return "";

    if (matches.exact.length > 0) {
        return `<div class="dup-badge">${ICONS.alert}${esc(t("dup.exact"))}</div>`;
    }
    const targetLabel = state.view === "contacts" ? t("dup.homonym") : `${t("dup.linked")} (${esc(o.company)})`;
    return `<div class="dup-badge">${ICONS.alert}${totalMatches} ${targetLabel}</div>`;
}

export function renderDrawerDuplicates() {
    const box = $("#d-dup");
    const o = cur();
    if (!box || !o) return;

    const { exact, cross } = findMatches(state.curScope, o, o.id);
    const all = [...exact.map((m) => ({ ...m, strict: true })), ...cross.map((m) => ({ ...m, strict: false }))];

    if (!all.length) {
        box.classList.add("hidden");
        box.innerHTML = "";
        return;
    }

    box.classList.remove("hidden");
    box.classList.toggle("strict", exact.length > 0);
    box.innerHTML = all
        .map(
            (m) =>
                `<div>${ICONS.alert}<b>${esc(m.label)}</b> · ${esc(t(`stage.${m.item.stage}`))} <button type="button" data-jump-scope="${m.scope}" data-jump-id="${
                    m.item.id
                }">${esc(t("dup.open"))}</button></div>`,
        )
        .join("");
}

export function renderDupAlerts(scope, payload, box, btn) {
    if (!box || !btn) return;
    const { exact, cross } = findMatches(scope, payload);

    if (!exact.length && !cross.length) {
        box.classList.add("hidden");
        box.innerHTML = "";
        btn.disabled = false;
        return;
    }

    box.classList.remove("hidden");
    box.classList.toggle("strict", exact.length > 0);
    btn.disabled = exact.length > 0;

    const lines = [];
    for (const m of exact) {
        lines.push(
            `<div>${ICONS.alert}<b>${esc(t("dup.exact"))}</b> ${esc(t("dup.already_in"))} ${esc(m.label)} (${esc(t(`stage.${m.item.stage}`))}) <button type="button" data-jump-scope="${
                m.scope
            }" data-jump-id="${m.item.id}">${esc(t("dup.view"))}</button></div>`,
        );
    }
    for (const m of cross) {
        lines.push(
            `<div>${ICONS.alert}<b>${esc(m.label)}</b> (${esc(t(`stage.${m.item.stage}`))}) <button type="button" data-jump-scope="${m.scope}" data-jump-id="${m.item.id}">${esc(t("dup.view"))}</button></div>`,
        );
    }
    box.innerHTML = lines.join("");
}
