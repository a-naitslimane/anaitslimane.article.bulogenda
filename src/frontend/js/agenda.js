import { $, esc } from "./dom.js";
import { dueLabel } from "./date.js";
import { t, trVal } from "./i18n.js";
import { state } from "./store.js";

export function renderAgenda() {
    const el = $("#rdv");
    if (!el) return;
    el.innerHTML =
        state.upcomingAppointments
            .map((a) => {
                const labelKind = trVal("appointment", a.kind);
                const contentText = a.prep || a.feedback || "";
                const noteText = [labelKind, a.who, contentText].filter(Boolean).join(" · ");
                return `<li data-scope="${a.scope}" data-id="${a.ref}"><b>${dueLabel(a.day)}</b> <strong>${esc(a.title)}</strong> <span>${esc(noteText)}</span></li>`;
            })
            .join("") || `<li class="mut">${esc(t("agenda.empty_rdv"))}</li>`;
}
