from typing import Any

from backend.db.engine import SQLiteEngine


class MainRepository:
    def __init__(self, engine: SQLiteEngine):
        self.engine = engine

    def get_by_id(self, table: str, rid: int) -> dict[str, Any] | None:
        rows = self.engine.run(f"SELECT * FROM {table} WHERE id = ?", [rid])
        return rows[0] if rows else None

    def create(self, table: str, values: dict[str, Any]) -> int:
        return self.engine.insert(table, values)

    def update(self, table: str, rid: int, values: dict[str, Any]) -> None:
        self.engine.update(table, rid, values)

    def delete_row(self, table: str, rid: int) -> None:
        self.engine.delete_row(table, rid)

    def delete_scoped_entity(self, scope: str, table: str, rid: int) -> None:
        self.engine.delete_row(table, rid)
        self.engine.run(
            "DELETE FROM history_logs WHERE scope = ? AND ref = ?", [scope, rid]
        )
        self.engine.run(
            "DELETE FROM appointments WHERE scope = ? AND ref = ?", [scope, rid]
        )
        if scope == "opps":
            self.engine.run("DELETE FROM actors WHERE opp_id = ?", [rid])

    def list_scoped(self, scope: str, table: str) -> list[dict[str, Any]]:
        last_expr = f"""NULLIF(MAX(
            IFNULL((SELECT MAX(day) FROM appointments WHERE scope = '{scope}' AND ref = t.id AND done = 1), ''),
            IFNULL((SELECT MAX(day) FROM history_logs WHERE scope = '{scope}' AND ref = t.id), '')
        ), '')"""
        sql = f"SELECT t.*, {last_expr} AS last_day FROM {table} t ORDER BY t.id DESC"
        return self.engine.run(sql)

    def list_actors(self) -> list[dict[str, Any]]:
        return self.engine.run("SELECT * FROM actors ORDER BY id")

    def list_all_appointments(self) -> list[dict[str, Any]]:
        return self.engine.run("SELECT * FROM appointments ORDER BY day, id")

    def list_upcoming_appointments(self, start_day: str) -> list[dict[str, Any]]:
        sql = """
        SELECT a.day, 'contacts' AS scope, a.ref,
               c.name || CASE WHEN c.company != '' THEN ' (' || c.company || ')' ELSE '' END AS title,
               a.prep, a.feedback, a.kind, a.who
        FROM appointments a JOIN contacts c ON c.id = a.ref
        WHERE a.scope = 'contacts' AND a.done = 0 AND a.day >= ?
        UNION ALL
        SELECT a.day, 'opps' AS scope, a.ref,
               o.company || CASE WHEN o.position != '' THEN ' · ' || o.position ELSE '' END AS title,
               a.prep, a.feedback, a.kind, a.who
        FROM appointments a JOIN opportunities o ON o.id = a.ref
        WHERE a.scope = 'opps' AND a.done = 0 AND a.day >= ?
        ORDER BY day ASC
        """
        return self.engine.run(sql, [start_day, start_day])

    def list_history_logs(self, scope: str, rid: int) -> list[dict[str, Any]]:
        return self.engine.run(
            "SELECT * FROM history_logs WHERE scope = ? AND ref = ? ORDER BY day DESC, id DESC",
            [scope, rid],
        )

    def find_duplicate(
        self, table: str, values: dict[str, Any], exclude_id: int | None = None
    ) -> dict[str, Any] | None:
        if table == "opportunities":
            company = str(values.get("company", "")).strip()
            position = str(values.get("position", "")).strip()
            if not company:
                return None
            sql = (
                "SELECT id, company, position, stage FROM opportunities "
                "WHERE LOWER(TRIM(company)) = LOWER(?) AND LOWER(TRIM(position)) = LOWER(?)"
            )
            args: list[Any] = [company, position]
        elif table == "contacts":
            name = str(values.get("name", "")).strip()
            company = str(values.get("company", "")).strip()
            if not name:
                return None
            sql = (
                "SELECT id, name, company, stage FROM contacts "
                "WHERE LOWER(TRIM(name)) = LOWER(?) AND LOWER(TRIM(company)) = LOWER(?)"
            )
            args = [name, company]
        else:
            return None

        if exclude_id is not None:
            sql += " AND id != ?"
            args.append(exclude_id)

        rows = self.engine.run(sql, args)
        return rows[0] if rows else None