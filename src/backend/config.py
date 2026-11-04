import os
from pathlib import Path

PACKAGE_DIR = Path(__file__).resolve().parent
STATIC_DIR = PACKAGE_DIR.parent / "frontend"
SCHEMA_PATH = PACKAGE_DIR / "db" / "schema.sql"

DEFAULT_DB_PATH = Path(os.environ.get("BULOGENDA_DB", Path.cwd() / "suivi.db"))
DEFAULT_PORT = int(os.environ.get("BULOGENDA_PORT", "8765"))
DEFAULT_HOST = os.environ.get("BULOGENDA_HOST", "127.0.0.1")

CONTACT_STAGES = ["to_contact", "contacted", "followed_up", "in_discussion", "closed"]
OPP_STAGES = ["applied", "in_progress", "won", "declined", "rejected"]

CONTACT_FIELDS = [
    "name",
    "role",
    "company",
    "location",
    "email",
    "phone",
    "link",
    "stage",
    "notes",
]

OPP_FIELDS = [
    "company",
    "position",
    "source",
    "sent_at",
    "kind",
    "contract",
    "location",
    "remote",
    "team",
    "salary",
    "duration",
    "start_date",
    "link",
    "description",
    "stage",
    "reason",
    "notes",
]

ACTOR_FIELDS = ["name", "role", "contact", "email", "phone", "link", "day"]
APPOINTMENT_FIELDS = [
    "day",
    "kind",
    "mode",
    "location",
    "who",
    "done",
    "prep",
    "feedback",
]
HISTORY_LOG_FIELDS = ["day", "kind", "who", "note"]

SUB_FIELDS = {
    "actors": ACTOR_FIELDS,
    "appointments": APPOINTMENT_FIELDS,
    "history_logs": HISTORY_LOG_FIELDS,
}

SCOPES = {
    "contacts": ("contacts", CONTACT_FIELDS, "name"),
    "opps": ("opportunities", OPP_FIELDS, "company"),
}
