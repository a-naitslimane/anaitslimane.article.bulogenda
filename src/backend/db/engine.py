import sqlite3
import threading
from pathlib import Path
from typing import Any


class SQLiteEngine:
    def __init__(self, db_path: Path, schema_path: Path):
        self.lock = threading.Lock()
        self.conn = sqlite3.connect(str(db_path), check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.init_schema(schema_path)

    def init_schema(self, schema_path: Path) -> None:
        sql = schema_path.read_text(encoding="utf-8")
        with self.lock:
            self.conn.executescript(sql)
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