import { APPLIED, ACTIVE_OPP_STAGES, CATEGORY_COLORS, ICONS } from "./constants.js";
import { esc } from "./dom.js";
import { today, fmtDateTime, daysFrom, ago, dueLabel } from "./date.js";
import { t, trVal } from "./i18n.js";
import { state, titleOf, isClosed, byOpp, appointmentsOf } from "./store.js";
import { renderDuplicateBadge } from "./duplicates.js";

function fmtLoc(loc) {
    if (!loc) return "";
    const idx = loc.lastIndexOf(",");
    if (idx === -1) return `<b class="loc-country">${esc(loc.trim())}</b>`;
    const city = loc.slice(0, idx).trim();
    const country = loc.slice(idx + 1).trim();
    return `${esc(city)}, <b class="loc-country">${esc(country)}</b>`;
}

function oppExtra(o) {
    const appts = appointmentsOf(state.view, o.id);
    const as = byOpp(o.id);

    const tags = [];
    if (o.contract) tags.push(`<span class="c-tag">${esc(trVal("contract", o.contract))}</span>`);
    if (o.remote) tags.push(`<span class="c-tag">${esc(trVal("remote", o.remote))}</span>`);
    if (o.location) tags.push(`<span class="c-tag tag-loc">${fmtLoc(o.location)}</span>`);
    if (o.salary) tags.push(`<span class="c-tag tag-sal">${esc(o.salary)}</span>`);

    const tagsHtml = tags.length ? `<div class="c-tags">${tags.join("")}</div>` : "";

    return (
        tagsHtml +
        (appts.length ? `<div class="rounds">${appts.map((a) => `<span class="${a.done ? "ok" : ""}">${a.done ? "✓" : "○"} ${esc(trVal("appointment", a.kind))}</span>`).join("")}</div>` : "") +
        (as.length
            ? `<div class="via c-meta">${esc(t("board.via"))} ${as
                  .map((a) => `<span><i class="dot" style="background:${CATEGORY_COLORS[a.category] || "#6b7280"}"></i>${esc(a.name)}</span>`)
                  .join(", ")}</div>`
            : "") +
        (!ACTIVE_OPP_STAGES.includes(o.stage) && o.reason ? `<div class="c-reason">${esc(o.reason)}</div>` : "")
    );
}

export function renderCard(o) {
    const closed = isClosed(state.view, o);
    const stale = !closed && o.last_day && daysFrom(o.last_day) > 14;

    let due = "";
    if (!closed) {
        const nextAppt = appointmentsOf(state.view, o.id).find((a) => !a.done);
        if (nextAppt) {
            due += `<div class="due ${nextAppt.day < today() ? "late" : ""}">${ICONS.calendar}${dueLabel(nextAppt.day)} · ${esc(trVal("appointment", nextAppt.kind))}</div>`;
        }
    }

    const dupBadge = renderDuplicateBadge(o);

    const footLines = [];
    if (state.view === "opps" && o.sent_at) {
        const sentDay = o.sent_at.slice(0, 10);
        const waitDays = daysFrom(sentDay);
        const waitingLong = !closed && o.stage === APPLIED && waitDays >= 10;
        const rel = waitDays > 0 ? ` · <b>${esc(ago(sentDay))}</b>` : "";
        footLines.push(`<div class="${waitingLong ? "stale" : ""}">${esc(t("board.sent_on"))} ${esc(fmtDateTime(o.sent_at))}${rel}</div>`);
    }
    if (o.last_day) {
        footLines.push(`<div class="${stale ? "stale" : ""}">${esc(t("board.last_exchange"))} <b>${esc(ago(o.last_day))}</b></div>`);
    }

    const isOpps = state.view === "opps";

    let contactSubHtml = "";
    if (!isOpps) {
        const parts = [
            esc(o.position),
            esc(trVal("category", o.category)),
            esc(o.company),
            fmtLoc(o.location)
        ].filter(Boolean);
        contactSubHtml = `<div class="c-sub">${parts.join(" · ")}</div>`;
    }

    return `<article draggable="true" data-id="${o.id}" class="${state.curScope === state.view && o.id === state.curId ? "sel " : ""}${closed ? "closed" : ""}">
    <strong class="c-title">${esc(titleOf(state.view, o))}</strong>
    ${isOpps && o.position ? `<div class="c-pos">${esc(o.position)}</div>` : contactSubHtml}
    ${isOpps ? oppExtra(o) : ""}
    ${due}
    ${dupBadge}
    ${footLines.length ? `<div class="c-foot">${footLines.join("")}</div>` : ""}
  </article>`;
}
