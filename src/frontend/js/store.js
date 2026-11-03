import { ACTIVE_OPP_STAGES, TITLE_FIELD } from "./constants.js";

export const state = {
    view: "opps",
    data: { contacts: [], opps: [] },
    actors: [],
    appointments: [],
    upcomingAppointments: [],
    curScope: null,
    curId: null,
    kind: "linkedin",
};

export const norm = (s) =>
    String(s || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

export const titleOf = (s, o) => o[TITLE_FIELD[s]];
export const isClosed = (s, o) => (s === "opps" ? !ACTIVE_OPP_STAGES.includes(o.stage) : o.stage === "closed");
export const cur = () => state.curScope && state.data[state.curScope].find((o) => o.id === state.curId);
export const byOpp = (id) => state.actors.filter((a) => a.opp_id === id);
export const appointmentsOf = (scope, id) => state.appointments.filter((a) => (a.scope || "opps") === scope && a.ref === id);
