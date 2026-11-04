import { $, esc } from "./dom.js";
import { today, nowLocalISO, fmtDateTime } from "./date.js";
import { api } from "./http.js";
import { t, trVal } from "./i18n.js";
import { state, cur, appointmentsOf } from "./store.js";

let editAppointment = null;

function syncLocationVisibility() {
    const isOnsite = $("#rd-mode").value === "onsite";
    $("#rd-loc-wrap").classList.toggle("hidden", !isOnsite);
    if (isOnsite && !$("#rd-location").value.trim()) {
        const o = cur();
        if (state.curScope === "opps" && o && o.location) {
            $("#rd-location").value = o.location;
        }
    }
}

export function renderAppointments() {
    if (!state.curId) return;
    $("#rlist").innerHTML =
        appointmentsOf(state.curScope, state.curId)
            .map((a) => {
                const late = !a.done && String(a.day).slice(0, 10) < today();
                const statusBadge = a.done
                    ? `<span class="badge">${esc(t("drawer.badge_done"))}</span>`
                    : late
                      ? `<span class="badge late">${esc(t("drawer.badge_late"))}</span>`
                      : `<span class="badge soon">${esc(t("drawer.badge_soon"))}</span>`;

                const completeBtn = !a.done ? `<button type="button" class="btn-rd-done" data-appt-finish="${a.id}">${esc(t("drawer.btn_complete"))}</button>` : "";

                const locLine = a.mode === "onsite" && a.location ? `<div class="appt-who">${esc(a.location)}</div>` : "";

                const prepBlock = a.prep ? `<div class="rd-box"><span class="rd-lbl">${esc(t("drawer.lbl_prep"))}</span><div class="rd-txt">${esc(a.prep)}</div></div>` : "";

                const feedbackBlock = a.feedback ? `<div class="rd-box rd-cr"><span class="rd-lbl">${esc(t("drawer.lbl_feedback"))}</span><div class="rd-txt">${esc(a.feedback)}</div></div>` : "";

                return `<div class="appt-item ${a.done ? "is-done" : ""}">
                    <div class="appt-top">
                        <div class="appt-title">
                            <b>${esc(fmtDateTime(a.day))}</b>
                            <span class="mut">·</span>
                            <span class="appt-kind">${esc(trVal("appointment", a.kind))}</span>
                            <span class="badge">${esc(trVal("mode", a.mode || "phone"))}</span>
                            ${statusBadge}
                        </div>
                        <div class="appt-actions">
                            ${completeBtn}
                            <button type="button" class="btn-icon" data-re="${a.id}" title="${esc(t("drawer.update"))}">✎</button>
                            <button type="button" class="btn-icon danger" data-rx="${a.id}" title="${esc(t("drawer.delete"))}">×</button>
                        </div>
                    </div>
                    ${a.who ? `<div class="appt-who">${esc(a.who)}</div>` : ""}
                    ${locLine}
                    ${prepBlock}
                    ${feedbackBlock}
                </div>`;
            })
            .join("") || `<div class="mut sm">${esc(t("drawer.no_appointments"))}</div>`;
}

export function showAppointmentForm(show, a = null, focusFeedback = false) {
    $("#r-form").classList.toggle("hidden", !show);
    $("#r-toggle").classList.toggle("hidden", show);
    editAppointment = a ? a.id : null;
    const defaultKind = state.curScope === "contacts" ? "discovery_call" : "hr_interview";
    $("#rd-kind").value = a ? a.kind : defaultKind;
    $("#rd-mode").value = a && a.mode ? a.mode : "phone";
    $("#rd-location").value = a && a.location ? a.location : "";
    $("#rd-day").value = a ? (a.day.length === 10 ? `${a.day}T09:00` : a.day) : nowLocalISO();
    const o = cur();
    const defaultWho = state.curScope === "contacts" && o ? o.name : "";
    $("#rd-who").value = a ? a.who || "" : defaultWho;
    $("#rd-done").value = a ? String(a.done ? 1 : 0) : "0";
    $("#rd-prep").value = a ? a.prep || "" : "";
    $("#rd-feedback").value = a ? a.feedback || "" : "";
    $("#rd-save").textContent = a ? t("drawer.update") : t("drawer.save");
    syncLocationVisibility();
    if (show) {
        if (focusFeedback) {
            $("#rd-done").value = "1";
            $("#rd-feedback").focus();
        } else {
            $("#rd-day").focus();
        }
    }
}

export async function handleAppointmentClick(hit, onReload) {
    let el;
    if ((el = hit("[data-appt-finish]"))) {
        const a = state.appointments.find((x) => x.id === +el.dataset.apptFinish);
        if (a) showAppointmentForm(true, a, true);
        return true;
    }
    if ((el = hit("[data-re]"))) {
        showAppointmentForm(
            true,
            state.appointments.find((x) => x.id === +el.dataset.re),
        );
        return true;
    }
    if ((el = hit("[data-rx]"))) {
        if (confirm("Supprimer ce rendez-vous ?")) {
            await api("DELETE", `/api/appointments/${el.dataset.rx}`);
            await onReload();
        }
        return true;
    }
    return false;
}

export function bindAppointmentForm(onReload) {
    $("#r-toggle").onclick = () => showAppointmentForm(true, null);
    $("#r-cancel").onclick = () => showAppointmentForm(false, null);
    $("#rd-mode").onchange = syncLocationVisibility;
    $("#r-form").onsubmit = async (e) => {
        e.preventDefault();
        const mode = $("#rd-mode").value;
        const d = {
            kind: $("#rd-kind").value,
            mode,
            location: mode === "onsite" ? $("#rd-location").value.trim() : "",
            day: $("#rd-day").value,
            who: $("#rd-who").value.trim(),
            done: +$("#rd-done").value,
            prep: $("#rd-prep").value.trim(),
            feedback: $("#rd-feedback").value.trim(),
        };
        if (!d.day) return;
        if (editAppointment) await api("PUT", `/api/appointments/${editAppointment}`, d);
        else await api("POST", `/api/${state.curScope}/${state.curId}/appointments`, d);
        showAppointmentForm(false, null);
        await onReload();
    };
}
