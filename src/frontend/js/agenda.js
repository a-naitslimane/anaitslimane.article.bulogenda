import { ICONS } from "./constants.js";
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
                const mode = a.mode || "phone";
                const modeIcon = ICONS[mode] || ICONS.phone;
                const modeTitle = trVal("mode", mode);
                const locPart = mode === "onsite" && a.location ? a.location : "";
                const mainLabel = a.company || a.who || "";
                const subText = a.company ? [a.who, locPart || modeTitle].filter(Boolean).join(" · ") : [locPart || modeTitle].filter(Boolean).join(" · ");

                return `<li data-scope="${a.scope}" data-id="${a.ref}">
                    <b>${esc(dueLabel(a.day))}</b>
                    <span class="ag-mode" title="${esc(modeTitle)}">${modeIcon}</span>
                    <strong>${esc(mainLabel)}</strong>
                    <span>${esc(subText)}</span>
                </li>`;
            })
            .join("") || `<li class="mut">${esc(t("agenda.empty_rdv"))}</li>`;
}
