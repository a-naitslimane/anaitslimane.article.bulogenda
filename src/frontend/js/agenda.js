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
                const modeBase = trVal("mode", a.mode || "phone");
                const modeLabel = a.mode === "onsite" && a.location ? `${modeBase} (${a.location})` : modeBase;
                const details = [a.who, modeLabel].filter(Boolean).join(" · ");
                const mainLabel = a.company || a.who || "";
                const subLabel = a.company ? details : modeLabel;
                return `<li data-scope="${a.scope}" data-id="${a.ref}">
                    <b>${esc(dueLabel(a.day))}</b>
                    <strong>${esc(mainLabel)}</strong>
                    <span>${esc(subLabel)}</span>
                </li>`;
            })
            .join("") || `<li class="mut">${esc(t("agenda.empty_rdv"))}</li>`;
}
