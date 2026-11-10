import { $, esc, url } from "./dom.js";
import { today, fmt } from "./date.js";
import { api } from "./http.js";
import { t, trVal } from "./i18n.js";
import { state, byOpp } from "./store.js";
import { CATEGORIES, CATEGORY_COLORS, ICONS } from "./constants.js";

let editActor = null;

export function renderActors() {
    if (state.curScope !== "opps") return;
    $("#alist").innerHTML =
        byOpp(state.curId)
            .map((a) => {
                const col = CATEGORY_COLORS[a.category] || "#6b7280";
                const links = [
                    a.email ? `<a href="mailto:${esc(a.email)}">${esc(a.email)}</a>` : "",
                    a.phone ? `<a href="tel:${esc(a.phone)}">${esc(a.phone)}</a>` : "",
                    a.link ? `<a href="${esc(url(a.link))}" target="_blank" rel="noopener">↗</a>` : "",
                ]
                    .filter(Boolean)
                    .join(" · ");
                return `<div class="actor"><i class="dot big" style="background:${col}"></i><div class="ab">
      <div><b>${esc(a.name)}</b> <span class="badge" style="color:${col};border-color:${col}">${esc(trVal("category", a.category))}</span>
      <span class="r hov appt-btn-group"><button type="button" class="btn-icon" data-ae="${a.id}" title="${esc(t("drawer.update"))}">${ICONS.edit}</button><button type="button" class="btn-icon danger" data-ad="${a.id}" title="${esc(t("drawer.delete"))}">${ICONS.trash}</button></span></div>
      ${a.contact ? `<div class="mut sm">${esc(a.contact)}</div>` : ""}
      ${links ? `<div class="sm">${links}</div>` : ""}
      ${a.day ? `<div class="mut sm">${esc(t("drawer.linked_on"))} ${fmt(a.day)}</div>` : ""}</div></div>`;
            })
            .join("") || `<div class="mut sm">${esc(t("drawer.no_actors"))}</div>`;
}

export function showActorForm(show, a = null) {
    $("#a-form").classList.toggle("hidden", !show);
    $("#a-toggle").classList.toggle("hidden", show);
    editActor = a ? a.id : null;
    $("#an").value = a ? a.name : "";
    $("#ar").value = a ? a.category : CATEGORIES[0];
    $("#ac").value = a ? a.contact || "" : "";
    $("#am").value = a ? a.email || "" : "";
    $("#ap").value = a ? a.phone || "" : "";
    $("#alk").value = a ? a.link || "" : "";
    $("#aa").textContent = a ? t("drawer.update") : t("drawer.save");
    if (show) $("#an").focus();
}

export async function handleActorClick(hit, onReload) {
    let el;
    if ((el = hit("[data-ad]"))) {
        if (confirm("Retirer cet intermédiaire ?")) {
            await api("DELETE", `/api/actors/${el.dataset.ad}`);
            await onReload();
        }
        return true;
    }
    if ((el = hit("[data-ae]"))) {
        showActorForm(
            true,
            state.actors.find((a) => a.id === +el.dataset.ae),
        );
        return true;
    }
    return false;
}

export function bindActorForm(onReload) {
    $("#a-toggle").onclick = () => showActorForm(true, null);
    $("#a-cancel").onclick = () => showActorForm(false, null);
    $("#a-form").onsubmit = async (e) => {
        e.preventDefault();
        const d = {
            name: $("#an").value.trim(),
            category: $("#ar").value,
            contact: $("#ac").value.trim(),
            email: $("#am").value.trim(),
            phone: $("#ap").value.trim(),
            link: $("#alk").value.trim(),
        };
        if (!d.name) return;
        if (editActor) await api("PUT", `/api/actors/${editActor}`, d);
        else await api("POST", `/api/opps/${state.curId}/actors`, { ...d, day: today() });
        showActorForm(false, null);
        await onReload();
    };
}
