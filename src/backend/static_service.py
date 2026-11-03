import mimetypes
import re
from pathlib import Path

INCLUDE_PATTERN = re.compile(r"<!--\s*INCLUDE:\s*(.+?)\s*-->")


class StaticFileService:
    def __init__(self, static_dir: Path):
        self.static_dir = static_dir.resolve()

    def resolve_safe_path(self, relative_path: str) -> Path | None:
        target = (self.static_dir / relative_path).resolve()
        try:
            target.relative_to(self.static_dir)
        except ValueError:
            return None
        return target if target.is_file() else None

    def render_html_with_includes(self, html_file: Path) -> bytes:
        content = html_file.read_text(encoding="utf-8")

        def replace_include(match: re.Match) -> str:
            inc_file = self.resolve_safe_path(match.group(1).strip())
            return inc_file.read_text(encoding="utf-8") if inc_file else ""

        merged = INCLUDE_PATTERN.sub(replace_include, content)
        return merged.encode("utf-8")

    def get_file(self, url_path: str) -> tuple[bytes, str] | None:
        rel_path = "index.html" if url_path in ("/", "") else url_path.lstrip("/")
        target_file = self.resolve_safe_path(rel_path)
        if not target_file:
            return None

        if target_file.name == "index.html":
            return (
                self.render_html_with_includes(target_file),
                "text/html; charset=utf-8",
            )

        content_type, _ = mimetypes.guess_type(str(target_file))
        content_type = content_type or "application/octet-stream"
        if content_type.startswith("text/") or content_type == "application/javascript":
            content_type += "; charset=utf-8"

        return target_file.read_bytes(), content_type