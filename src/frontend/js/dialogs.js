import { STAGES, APPLIED, OPEN, CROLES, CONTRACTS, OPP_SOURCES } from "./constants.js";
import { $ } from "./dom.js";
import { nowLocalISO } from "./date.js";
import { api } from "./http.js";
import { opts } from "./i18n.js";
import { state } from "./store.js";
import { renderDupAlerts } from "./duplicates.js";

export function closeDialogs() {
    if ($("#dlg-contact") && $("#dlg-contact").open) $("#dlg-contact").close();
    if ($("#dlg-opp") && $("#dlg-opp").open) $("#dlg-opp").close();
}

export function anyDialogOpen() {
    return Boolean(($("#dlg-contact") && $("#dlg-contact").open) || ($("#dlg-opp") && $("#dlg-opp").open));
}

export function openNew(stage) {
    if (state.view === "contacts") {
        ["#nc-name", "#nc-company", "#nc-email", "#nc-phone", "#nc-link"].forEach((id) => {
            if ($(id)) $(id).value = "";
        });
        $("#nc-role").value = CROLES[0];
        $("#nc-stage").innerHTML = opts(STAGES.contacts, "stage");
        $("#nc-stage").value = stage || STAGES.contacts[0];
        $("#nc-dup").classList.add("hidden");
        $("#nc-dup").innerHTML = "";
        $("#nc-submit").disabled = false;
        $("#dlg-contact").showModal();
        $("#nc-name").focus();
    } else {
        ["#no-company", "#no-position", "#no-link", "#no-desc"].forEach((id) => {
            if ($(id)) $(id).value = "";
        });
        $("#no-source").value = stage === OPEN ? "inbound" : OPP_SOURCES[0];
        $("#no-contract").value = CONTRACTS[0];
        $("#no-sent").value = stage === OPEN ? "" : nowLocalISO();
        $("#no-stage").innerHTML = opts(STAGES.opps, "stage");
        $("#no-stage").value = stage || APPLIED;
        $("#no-dup").classList.add("hidden");
        $("#no-dup").innerHTML = "";
        $("#no-submit").disabled = false;
        $("#dlg-opp").showModal();
        $("#no-company").focus();
    }
}

export function bindDialogEvents(onReload) {
    if ($("#no-source")) {
        $("#no-source").onchange = (e) => {
            const src = e.target.value;
            if (src === "inbound" || src === "network") {
                $("#no-stage").value = OPEN;
                if ($("#no-sent")) $("#no-sent").value = "";
            } else {
                $("#no-stage").value = APPLIED;
                if ($("#no-sent") && !$("#no-sent").value) $("#no-sent").value = nowLocalISO();
            }
        };
    }

    $("#form-contact").addEventListener("input", () => {
        renderDupAlerts("contacts", { name: $("#nc-name").value.trim(), company: $("#nc-company").value.trim() }, $("#nc-dup"), $("#nc-submit"));
    });

    $("#form-opp").addEventListener("input", () => {
        renderDupAlerts("opps", { company: $("#no-company").value.trim(), position: $("#no-position").value.trim() }, $("#no-dup"), $("#no-submit"));
    });

    $("#form-contact").onsubmit = async (e) => {
        e.preventDefault();
        const name = $("#nc-name").value.trim();
        if (!name) return $("#nc-name").focus();

        const body = {
            name,
            role: $("#nc-role").value,
            company: $("#nc-company").value.trim(),
            email: $("#nc-email").value.trim(),
            phone: $("#nc-phone").value.trim(),
            link: $("#nc-link").value.trim(),
            stage: $("#nc-stage").value,
        };

        const res = await api("POST", "/api/contacts", body);
        if (res.error === "duplicate") {
            renderDupAlerts("contacts", body, $("#nc-dup"), $("#nc-submit"));
            return;
        }
        closeDialogs();
        await onReload();
    };

    $("#form-opp").onsubmit = async (e) => {
        e.preventDefault();
        const company = $("#no-company").value.trim();
        if (!company) return $("#no-company").focus();

        const stage = $("#no-stage").value || APPLIED;
        const sentVal = $("#no-sent").value.trim();
        const body = {
            company,
            position: $("#no-position").value.trim(),
            source: $("#no-source").value,
            contract: $("#no-contract").value,
            sent_at: sentVal || (stage === APPLIED ? nowLocalISO() : ""),
            link: $("#no-link").value.trim(),
            description: $("#no-desc").value.trim(),
            stage,
        };

        const res = await api("POST", "/api/opps", body);
        if (res.error === "duplicate") {
            renderDupAlerts("opps", body, $("#no-dup"), $("#no-submit"));
            return;
        }
        closeDialogs();
        await onReload();
    };
}
