from datetime import date
from typing import Any


def today() -> str:
    return date.today().isoformat()


def pick(data: dict[str, Any], allowed: list[str]) -> dict[str, Any]:
    return {k: data[k] for k in allowed if k in data}