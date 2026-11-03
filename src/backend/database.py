import sqlite3
import threading
from pathlib import Path
from typing import Any

SCHEMA = """
CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'recruiter',
    company TEXT DEFAULT '',
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    link TEXT DEFAULT '',
    stage TEXT DEFAULT 'to_contact',
    notes TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    position TEXT DEFAULT '',
    source TEXT DEFAULT 'job_ad',
    sent_at TEXT DEFAULT '',
    kind TEXT DEFAULT 'end_client',
    contract TEXT DEFAULT '',
    location TEXT DEFAULT '',
    remote TEXT DEFAULT '',
    team TEXT DEFAULT '',
    salary TEXT DEFAULT '',
    duration TEXT DEFAULT '',
    start_date TEXT DEFAULT '',
    link TEXT DEFAULT '',
    description TEXT DEFAULT '',
    stage TEXT DEFAULT 'applied',
    reason TEXT DEFAULT '',
    notes TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS history_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scope TEXT NOT NULL,
    ref INTEGER NOT NULL,
    day TEXT NOT NULL,
    kind TEXT DEFAULT 'other',
    who TEXT DEFAULT '',
    note TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS actors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opp_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'employee',
    contact TEXT DEFAULT '',
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    link TEXT DEFAULT '',
    day TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scope TEXT DEFAULT 'opps',
    ref INTEGER NOT NULL,
    kind TEXT DEFAULT 'discovery_call',
    day TEXT NOT NULL,
    who TEXT DEFAULT '',
    prep TEXT DEFAULT '',
    feedback TEXT DEFAULT '',
    done INTEGER DEFAULT 0
);
"""


def pick(data: dict[str, Any], allowed: list[str]) -> dict[str, Any]:
    return {k: data[k] for k in allowed if k in data}


class Database:
    def __init__(self, path: Path):
        self.lock = threading.Lock()
        self.conn = sqlite3.connect(str(path), check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.init_schema()

    def init_schema(self) -> None:
        with self.lock:
            self.conn.executescript(SCHEMA)
            self.conn.commit()

    def run(
        self, sql: str, args: tuple[Any, ...] | list[Any] = ()
    ) -> list[dict[str, Any]]:
        with self.lock:
            cur = self.conn.execute(sql, args)
            rows = [dict(r) for r in cur.fetchall()]
            self.conn.commit()
            return rows

    def insert(self, table: str, values: dict[str, Any]) -> int:
        cols = ", ".join(values.keys())
        placeholders = ", ".join(["?"] * len(values))
        with self.lock:
            cur = self.conn.execute(
                f"INSERT INTO {table} ({cols}) VALUES ({placeholders})",
                tuple(values.values()),
            )
            self.conn.commit()
            return int(cur.lastrowid or 0)

    def update(self, table: str, rid: int, values: dict[str, Any]) -> None:
        if not values:
            return
        assign = ", ".join(f"{k} = ?" for k in values.keys())
        self.run(f"UPDATE {table} SET {assign} WHERE id = ?", [*values.values(), rid])

    def delete_row(self, table: str, rid: int) -> None:
        self.run(f"DELETE FROM {table} WHERE id = ?", [rid])

    def delete_scoped_entity(self, scope: str, table: str, rid: int) -> None:
        self.delete_row(table, rid)
        self.run("DELETE FROM history_logs WHERE scope = ? AND ref = ?", [scope, rid])
        self.run("DELETE FROM appointments WHERE scope = ? AND ref = ?", [scope, rid])
        if scope == "opps":
            self.run("DELETE FROM actors WHERE opp_id = ?", [rid])

    def list_scoped(self, scope: str, table: str) -> list[dict[str, Any]]:
        last_expr = f"""NULLIF(MAX(
            IFNULL((SELECT MAX(day) FROM appointments WHERE scope = '{scope}' AND ref = t.id AND done = 1), ''),
            IFNULL((SELECT MAX(day) FROM history_logs WHERE scope = '{scope}' AND ref = t.id), '')
        ), '')"""
        sql = f"SELECT t.*, {last_expr} AS last_day FROM {table} t ORDER BY t.id DESC"
        return self.run(sql)

    def list_history_logs(self, scope: str, rid: int) -> list[dict[str, Any]]:
        return self.run(
            "SELECT * FROM history_logs WHERE scope = ? AND ref = ? ORDER BY day DESC, id DESC",
            [scope, rid],
        )

    def list_appointments(self, start_day: str) -> list[dict[str, Any]]:
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
        return self.run(sql, [start_day, start_day])

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

        rows = self.run(sql, args)
        return rows[0] if rows else None
