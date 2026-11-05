import { KINDS, ICONS } from "./constants.js";
import { $, esc } from "./dom.js";
import { today, fmt } from "./date.js";
import { api } from "./http.js";
import { t, trVal } from "./i18n.js";
import { state } from "./store.js";

export function renderKinds() {
    $("#d-kinds").innerHTML = KINDS.map((k) => `<button type="button" data-k="${esc(k)}" class="${state.kind === k ? "on" : ""}">${ICONS[k] || ICONS.other}${esc(trVal("ev", k))}</button>`).join("");
}

export async function loadHistoryLogs() {
    if (!state.curId) return;
    const logs = await api("GET", `/api/${state.curScope}/${state.curId}/history_logs`);
    $("#el").innerHTML =
        logs
            .map(
                (x) => `<div class="ev"><span class="ico">${ICONS[x.kind] || ICONS.other}</span><div class="eb">
    <div><b>${fmt(x.day)}</b> · <span class="mut sm">${esc(trVal("ev", x.kind))}</span>${
        x.who ? ` · <strong class="sm">${esc(x.who)}</strong>` : ""
    }<button type="button" class="btn-icon danger x r hov" data-ev="${x.id}" title="${esc(t("drawer.delete"))}">${ICONS.trash}</button></div>
    ${x.note ? `<div style="margin-top:2px">${esc(x.note)}</div>` : ""}</div></div>`,
            )
            .join("") || `<div class="mut sm">${esc(t("drawer.no_events"))}</div>`;
}

export async function handleHistoryLogClick(hit, onReload) {
    let el;
    if ((el = hit("[data-ev]"))) {
        await api("DELETE", `/api/history_logs/${el.dataset.ev}`);
        await loadHistoryLogs();
        await onReload();
        return true;
    }
    if ((el = hit("[data-k]"))) {
        state.kind = el.dataset.k;
        renderKinds();
        $("#en").focus();
        return true;
    }
    return false;
}

export function bindHistoryLogForm(onReload) {
    async function addHistoryLog() {
        const day = $("#ed").value || today();
        const note = $("#en").value.trim();
        const who = $("#ew") ? $("#ew").value.trim() : "";
        if (!state.curId || (!note && !who)) return;
        await api("POST", `/api/${state.curScope}/${state.curId}/history_logs`, {
            day: day > today() ? today() : day,
            kind: state.kind,
            who,
            note,
        });
        $("#en").value = "";
        await loadHistoryLogs();
        await onReload();
    }

    $("#ea").onclick = addHistoryLog;
    $("#en").onkeydown = (e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            addHistoryLog();
        }
    };
}
