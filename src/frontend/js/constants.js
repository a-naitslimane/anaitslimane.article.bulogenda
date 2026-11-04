export const SCOPES = ["contacts", "opps"];
export const APPLIED = "applied";
export const OPEN = "in_progress";
export const ACTIVE_OPP_STAGES = [APPLIED, OPEN];

export const STAGES = {
    contacts: ["to_contact", "contacted", "followed_up", "in_discussion", "closed"],
    opps: [APPLIED, OPEN, "won", "declined", "rejected"],
};

export const TITLE_FIELD = {
    contacts: "name",
    opps: "company",
};

export const OPP_SOURCES = ["job_ad", "spontaneous", "inbound", "network"];
export const CROLES = ["recruiter", "agency", "esn", "client", "network", "other"];
export const COMPANY_KINDS = ["end_client", "esn", "other"];
export const CONTRACTS = ["", "freelance", "cdi", "portage", "other"];
export const REMOTES = ["", "onsite", "hybrid", "remote"];

export const APPOINTMENT_KINDS = ["discovery_call", "hr_interview", "tech_interview", "cto_interview", "tech_test", "team_fit", "client_interview", "other"];
export const APPOINTMENT_MODES = ["phone", "video", "onsite"];

export const IROLES = ["employee", "headhunter", "agency", "esn", "platform", "network", "other"];

export const ROLE_COLORS = {
    employee: "#0d9488",
    headhunter: "#d97706",
    agency: "#7c3aed",
    esn: "#2563eb",
    platform: "#65a30d",
    network: "#db2777",
    other: "#6b7280",
};

export const KINDS = ["linkedin", "email", "call", "other"];

export const ICONS = {
    calendar: `<svg class="svg-ico" viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 6.5h12M5.5 1.5v2M10.5 1.5v2"/></svg>`,
    clock: `<svg class="svg-ico" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6"/><path d="M8 4.8V8l2.2 1.4"/></svg>`,
    send: `<svg class="svg-ico" viewBox="0 0 16 16"><path d="M14 2L7 9M14 2l-4.5 12-2.5-5-5-2.5L14 2z"/></svg>`,
    linkedin: `<svg class="svg-ico" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5.2 7v4M5.2 5v.01M8 11V8.5c0-1 .7-1.5 1.5-1.5S11 7.5 11 8.5V11"/></svg>`,
    email: `<svg class="svg-ico" viewBox="0 0 16 16"><rect x="2" y="3.5" width="12" height="9" rx="1.5"/><path d="M2.5 4.5L8 8.5l5.5-4"/></svg>`,
    call: `<svg class="svg-ico" viewBox="0 0 16 16"><path d="M5 2.5h-1.5a1 1 0 0 0-1 1c0 5.5 4.5 10 10 10a1 1 0 0 0 1-1V11l-2.5-1-1 1.5c-1.8-.9-3.1-2.2-4-4L7.5 6.5 6.5 4 5 2.5z"/></svg>`,
    other: `<svg class="svg-ico" viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.5"/></svg>`,
    alert: `<svg class="svg-ico" viewBox="0 0 16 16"><path d="M8 2.5l6 11H2l6-11zM8 6.8v3M8 11.8v.01"/></svg>`,
};

export const DEFAULT_KIND = {
    contacts: "linkedin",
    opps: "email",
};
