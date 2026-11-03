from typing import Any

from backend.config import HISTORY_LOG_FIELDS, SCOPES, SUB_FIELDS
from backend.db.repository import MainRepository
from backend.utils import pick, today


class MainController:
    def __init__(self, repo: MainRepository):
        self.repo = repo

    def get_actors(self) -> tuple[int, Any]:
        return 200, self.repo.list_actors()

    def get_appointments(self, query: dict[str, list[str]]) -> tuple[int, Any]:
        if "from" in query:
            start_day = query["from"][0] or today()
            return 200, self.repo.list_upcoming_appointments(start_day)
        return 200, self.repo.list_all_appointments()

    def handle_sub_item(
        self, method: str, table: str, rid: int, body: dict[str, Any]
    ) -> tuple[int, Any]:
        if method == "PUT" and table in SUB_FIELDS:
            self.repo.update(table, rid, pick(body, SUB_FIELDS[table]))
            return 200, {"ok": True}
        if method == "DELETE":
            self.repo.delete_row(table, rid)
            return 200, {"ok": True}
        return 404, {"error": "not found"}

    def handle_collection(
        self, method: str, scope: str, body: dict[str, Any]
    ) -> tuple[int, Any]:
        table, fields, required = SCOPES[scope]
        if method == "GET":
            return 200, self.repo.list_scoped(scope, table)
        if method == "POST":
            values = pick(body, fields)
            if not str(values.get(required, "")).strip():
                return 400, {"error": required}
            dup = self.repo.find_duplicate(table, values)
            if dup:
                return 409, {"error": "duplicate", "existing": dup}
            return 200, {"id": self.repo.create(table, values)}
        return 404, {"error": "not found"}

    def handle_entity(
        self, method: str, scope: str, rid: int, body: dict[str, Any]
    ) -> tuple[int, Any]:
        table, fields, _ = SCOPES[scope]
        if method == "PUT":
            values = pick(body, fields)
            if any(k in values for k in ("company", "position", "name")):
                current = self.repo.get_by_id(table, rid)
                if current:
                    merged = {**current, **values}
                    dup = self.repo.find_duplicate(table, merged, exclude_id=rid)
                    if dup:
                        return 409, {"error": "duplicate", "existing": dup}
            self.repo.update(table, rid, values)
            return 200, {"ok": True}
        if method == "DELETE":
            self.repo.delete_scoped_entity(scope, table, rid)
            return 200, {"ok": True}
        return 404, {"error": "not found"}

    def handle_entity_sub(
        self, method: str, scope: str, rid: int, sub: str, body: dict[str, Any]
    ) -> tuple[int, Any]:
        if sub == "history_logs":
            if method == "GET":
                return 200, self.repo.list_history_logs(scope, rid)
            if method == "POST":
                payload = {**pick(body, HISTORY_LOG_FIELDS), "scope": scope, "ref": rid}
                return 200, {"id": self.repo.create("history_logs", payload)}
        if sub == "appointments" and method == "POST":
            payload = {
                **pick(body, SUB_FIELDS["appointments"]),
                "scope": scope,
                "ref": rid,
            }
            return 200, {"id": self.repo.create("appointments", payload)}
        if sub == "actors" and scope == "opps" and method == "POST":
            payload = {**pick(body, SUB_FIELDS["actors"]), "opp_id": rid}
            return 200, {"id": self.repo.create("actors", payload)}
        return 404, {"error": "not found"}