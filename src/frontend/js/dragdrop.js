import { ACTIVE_OPP_STAGES } from "./constants.js";
import { $, $$ } from "./dom.js";
import { api } from "./http.js";
import { state } from "./store.js";
import { openDrawer } from "./drawer.js";

export function bindDragDropEvents(onReload) {
    document.addEventListener("dragstart", (e) => {
        const a = e.target.closest("article");
        if (a) e.dataTransfer.setData("text/plain", a.dataset.id);
    });

    document.addEventListener("dragover", (e) => {
        const s = e.target.closest("section");
        if (!s) return;
        e.preventDefault();
        $$("section.over").forEach((x) => {
            if (x !== s) x.classList.remove("over");
        });
        s.classList.add("over");
    });

    document.addEventListener("dragend", () => {
        $$("section.over").forEach((x) => x.classList.remove("over"));
    });

    document.addEventListener("drop", async (e) => {
        const s = e.target.closest("section");
        if (!s) return;
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        if (!id) return;
        await api("PUT", `/api/${state.view}/${id}`, { stage: s.dataset.stage });
        await onReload();
        if (state.view === "opps" && !ACTIVE_OPP_STAGES.includes(s.dataset.stage)) {
            openDrawer("opps", +id);
            $("#o-reason").focus();
        }
    });
}
