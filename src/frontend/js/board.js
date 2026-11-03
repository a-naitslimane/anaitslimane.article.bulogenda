import { SCOPES, STAGES, CROLES, CONTRACTS, OPP_SOURCES } from "./constants.js";
import { $, esc } from "./dom.js";
import { t, trVal, opts } from "./i18n.js";
import { state, byOpp } from "./store.js";
import { renderAgenda } from "./agenda.js";
import { renderCard } from "./card.js";

export function updateFilterDropdown() {
    const fr = $("#fr");
    const currentVal = fr.value;
    fr.innerHTML = `<option value="">${esc(t("filter.all"))}</option>`;
    if (state.view === "contacts") {
        fr.insertAdjacentHTML("beforeend", opts(CROLES, "role"));
    } else {
        const srcOpts = OPP_SOURCES.map((s) => `<option value="source:${esc(s)}">${esc(trVal("source", s))}</option>`).join("");
        const contractOpts = CONTRACTS.filter(Boolean)
            .map((c) => `<option value="contract:${esc(c)}">${esc(trVal("contract", c))}</option>`)
            .join("");
        fr.insertAdjacentHTML("beforeend", srcOpts + contractOpts);
    }
    fr.value = currentVal;
}

export function visible() {
    const q = $("#q").value.toLowerCase();
    const filterVal = $("#fr").value;
    return state.data[state.view].filter((o) => {
        const text = {
            contacts: [o.name, o.company, o.notes],
            opps: [o.company, o.position, o.location, o.team, o.description, o.notes].concat(byOpp(o.id).map((a) => a.name)),
        }[state.view];

        let matchesFilter = true;
        if (filterVal) {
            if (state.view === "contacts") {
                matchesFilter = o.role === filterVal;
            } else if (filterVal.startsWith("source:")) {
                matchesFilter = (o.source || "job_ad") === filterVal.slice(7);
            } else if (filterVal.startsWith("contract:")) {
                matchesFilter = o.contract === filterVal.slice(9);
            }
        }
        return matchesFilter && (!q || text.join(" ").toLowerCase().includes(q));
    });
}

export function renderBoard() {
    const list = visible();
    renderAgenda();

    for (const s of SCOPES) {
        $(`#tab-${s}`).innerHTML = `${esc(t(`nav.${s}`))}<i>${state.data[s].length}</i>`;
        $(`#tab-${s}`).classList.toggle("on", s === state.view);
    }

    $("#new").innerHTML = `${esc(t(`new.${state.view}`))} <kbd>N</kbd>`;
    $("#empty").textContent = t(`empty.${state.view}`);
    $("#empty").classList.toggle("hidden", state.data[state.view].length > 0);

    $("#board").innerHTML = STAGES[state.view]
        .map((s, i) => {
            const stageItems = list.filter((o) => o.stage === s);
            const canQuickAdd = state.view === "contacts" || i <= 1;
            const add = canQuickAdd ? `<button type="button" class="add" data-add="${s}" title="${esc(t("board.add_col"))}">+</button>` : "";
            return `<section data-stage="${s}"><h3><span>${esc(t(`stage.${s}`))}</span><i>${stageItems.length}</i>${add}</h3>${stageItems.map(renderCard).join("")}</section>`;
        })
        .join("");
}
