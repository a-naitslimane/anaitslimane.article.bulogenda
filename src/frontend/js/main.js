import { CROLES, COMPANY_KINDS, CONTRACTS, REMOTES, APPOINTMENT_KINDS, IROLES, OPP_SOURCES, APPOINTMENT_MODES } from "./constants.js";
import { $, setOptions } from "./dom.js";
import { today } from "./date.js";
import { api } from "./http.js";
import { opts, applyStaticTranslations, toggleLang } from "./i18n.js";
import { state, cur } from "./store.js";
import { renderBoard, updateFilterDropdown } from "./board.js";
import { handleAppointmentClick, bindAppointmentForm } from "./appointments.js";
import { handleActorClick, bindActorForm } from "./actors.js";
import { handleHistoryLogClick, bindHistoryLogForm } from "./history_logs.js";
import { openDrawer, closeDrawer, setView, bindDrawerEvents } from "./drawer.js";
import { openNew, closeDialogs, anyDialogOpen, bindDialogEvents } from "./dialogs.js";
import { bindDragDropEvents } from "./dragdrop.js";

async function load() {
    const r = await Promise.all([api("GET", "/api/contacts"), api("GET", "/api/opps"), api("GET", "/api/actors"), api("GET", "/api/appointments"), api("GET", `/api/appointments?from=${today()}`)]);
    state.data.contacts = r[0];
    state.data.opps = r[1];
    state.actors = r[2];
    state.appointments = r[3];
    state.upcomingAppointments = r[4];
    renderBoard();
    if (cur()) openDrawer(state.curScope, state.curId);
}

function populateSelects() {
    setOptions("#c-role", opts(CROLES, "role"));
    setOptions("#o-source", opts(OPP_SOURCES, "source"));
    setOptions("#o-kind", opts(COMPANY_KINDS, "kind"));
    setOptions("#o-contract", opts(CONTRACTS, "contract"));
    setOptions("#o-remote", opts(REMOTES, "remote"));
    setOptions("#rd-kind", opts(APPOINTMENT_KINDS, "appointment"));
    setOptions("#nc-role", opts(CROLES, "role"));
    setOptions("#no-source", opts(OPP_SOURCES, "source"));
    setOptions("#no-contract", opts(CONTRACTS, "contract"));
    setOptions("#ar", opts(IROLES, "role"));
    setOptions("#rd-mode", opts(APPOINTMENT_MODES, "mode"));
    updateFilterDropdown();
}

$("#q").oninput = renderBoard;
$("#fr").onchange = renderBoard;
$("#new").onclick = () => openNew(null);

bindDrawerEvents(load);
bindAppointmentForm(load);
bindActorForm(load);
bindHistoryLogForm(load);
bindDialogEvents(load);
bindDragDropEvents(load);

document.addEventListener("click", async (e) => {
    const hit = (s) => e.target.closest(s);
    let el;

    if (hit("[data-dlg-close]")) {
        closeDialogs();
        return;
    }
    if ((el = hit("[data-jump-id]"))) {
        const targetScope = el.dataset.jumpScope;
        const targetId = +el.dataset.jumpId;
        closeDialogs();
        if (targetScope !== state.view) setView(targetScope);
        openDrawer(targetScope, targetId);
        return;
    }
    if ((el = hit("[data-view]"))) {
        setView(el.dataset.view);
        return;
    }
    if (await handleHistoryLogClick(hit, load)) return;
    if (await handleActorClick(hit, load)) return;
    if (await handleAppointmentClick(hit, load)) return;

    if ((el = hit("[data-add]"))) {
        openNew(el.dataset.add);
        return;
    }
    if ((el = hit("li[data-id],article[data-id]"))) {
        const scope = el.dataset.scope || state.view;
        if (scope !== state.view) setView(scope);
        openDrawer(scope, +el.dataset.id);
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.curId && !anyDialogOpen()) {
        closeDrawer();
        return;
    }
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        openNew(null);
    }
    if (e.key === "/") {
        e.preventDefault();
        $("#q").focus();
    }
});

populateSelects();
applyStaticTranslations();

$("#lang-toggle").onclick = () => {
    toggleLang(() => {
        populateSelects();
        renderBoard();
        if (cur()) openDrawer(state.curScope, state.curId);
    });
};

load();
