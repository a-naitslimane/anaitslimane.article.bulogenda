import { ACTIVE_OPP_STAGES, TITLE_FIELD, DEFAULT_KIND, KINDS, ICONS } from "./constants.js";
import { $, esc, url } from "./dom.js";
import { today } from "./date.js";
import { api } from "./http.js";
import { t } from "./i18n.js";
import { state, cur, byOpp, appointmentsOf, titleOf } from "./store.js";
import { renderDrawerDuplicates } from "./duplicates.js";
import { renderBoard, updateFilterDropdown } from "./board.js";
import { renderAppointments, showAppointmentForm } from "./appointments.js";
import { renderActors, showActorForm } from "./actors.js";
import { renderKinds, loadHistoryLogs } from "./history_logs.js";

let flashTimer = null;
const saveTimers = {};

export function flash(msg = t("drawer.saved")) {
    $("#saved").textContent = msg;
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => {
        $("#saved").textContent = "";
    }, 1500);
}

export function updateWhoSuggestions() {
    const dl = $("#who-list");
    if (!dl) return;
    const o = cur();
    if (!o) {
        dl.innerHTML = "";
        return;
    }
    const names = new Set();
    if (state.curScope === "contacts") {
        if (o.name) names.add(o.name);
    } else {
        for (const a of byOpp(o.id)) {
            if (a.name) names.add(a.contact ? `${a.name} (${a.contact})` : a.name);
        }
        for (const r of appointmentsOf("opps", o.id)) {
            if (r.who) names.add(r.who);
        }
    }
    dl.innerHTML = [...names].map((n) => `<option value="${esc(n)}"></option>`).join("");
}

export function renderLinks() {
    const o = cur();
    if (!o) return;
    $("#d-links").innerHTML = [
        o.link ? `<a href="${esc(url(o.link))}" target="_blank" rel="noopener">${esc(t("drawer.open_link"))}</a>` : "",
        o.email ? `<a href="mailto:${esc(o.email)}">${ICONS.email}${esc(o.email)}</a>` : "",
        o.phone ? `<a href="tel:${esc(o.phone)}">${ICONS.call}${esc(o.phone)}</a>` : "",
    ]
        .filter(Boolean)
        .join("");
}

export function openDrawer(scope, id) {
    state.curScope = scope;
    state.curId = id;
    state.kind = DEFAULT_KIND[scope] || KINDS[0];
    const o = cur();
    if (!o) return;
    const d = $("#drawer");
    d.dataset.scope = scope;
    $("#d-title").dataset.f = TITLE_FIELD[scope];
    $("#d-title").value = titleOf(scope, o);
    for (const el of d.querySelectorAll("[data-f]")) {
        if (el.id !== "d-title") el.value = o[el.dataset.f] || "";
    }
    if (scope === "opps" && !o.source) {
        $("#o-source").value = "job_ad";
    }
    $("#o-reason").classList.toggle("hidden", scope !== "opps" || ACTIVE_OPP_STAGES.includes(o.stage));
    $("#ed").value = today();
    $("#ed").max = today();
    $("#en").value = "";
    if ($("#ew")) {
        $("#ew").value = scope === "contacts" ? o.name || "" : "";
    }

    updateWhoSuggestions();
    renderKinds();
    renderLinks();
    renderDrawerDuplicates();
    renderAppointments();
    renderActors();
    showActorForm(false);
    showAppointmentForm(false);
    $("#el").innerHTML = "";
    loadHistoryLogs();
    d.classList.add("open");
    document.body.classList.add("open");
    renderBoard();
}

export function closeDrawer() {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    state.curScope = null;
    state.curId = null;
    $("#drawer").classList.remove("open");
    document.body.classList.remove("open");
    renderBoard();
}

export function setView(v) {
    if (state.curScope && state.curScope !== v) closeDrawer();
    state.view = v;
    updateFilterDropdown();
    renderBoard();
}

export async function save(patch) {
    const o = cur();
    if (!o) return;
    Object.assign(o, patch);
    const res = await api("PUT", `/api/${state.curScope}/${o.id}`, patch);
    renderBoard();
    renderLinks();
    renderDrawerDuplicates();
    if (res && res.error === "duplicate") {
        flash(t("dup.refused"));
        return;
    }
    flash(t("drawer.saved"));
}

export function bindDrawerEvents(onReload) {
    $("#d-close").onclick = closeDrawer;

    $("#d-title").onkeydown = (e) => {
        if (e.key === "Enter") e.target.blur();
    };

    $("#drawer").addEventListener("input", (e) => {
        const f = e.target.dataset.f;
        if (!f) return;
        const o = cur();
        if (!o) return;
        const isTitle = e.target.id === "d-title";
        const val = isTitle ? e.target.value.trim() : e.target.value;
        o[f] = val;

        renderDrawerDuplicates();
        $("#saved").textContent = t("drawer.saving");
        clearTimeout(saveTimers[f]);
        saveTimers[f] = setTimeout(async () => {
            if (isTitle && !val) {
                e.target.value = titleOf(state.curScope, o);
                return;
            }
            await save({ [f]: val });
        }, 400);
    });

    $("#del").onclick = async () => {
        if (!confirm("Supprimer cet élément et tout son historique ?")) return;
        const s = state.curScope;
        const id = state.curId;
        closeDrawer();
        await api("DELETE", `/api/${s}/${id}`);
        await onReload();
    };
}
