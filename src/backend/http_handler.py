import json
import re
from http.server import BaseHTTPRequestHandler
from typing import Any
from urllib.parse import parse_qs, urlparse

from backend.main_controller import ProspectionController
from backend.static_service import StaticFileService

ROUTE_SUB_ITEM = re.compile(r"^/api/(actors|history_logs|appointments)/(\d+)$")
ROUTE_SCOPED = re.compile(
    r"^/api/(contacts|opps)(?:/(\d+))?(?:/(history_logs|actors|appointments))?$"
)


def make_handler(
    controller: ProspectionController, static_service: StaticFileService
):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args: Any) -> None:
            pass

        def send(self, code: int, body: Any, ctype: str = "application/json") -> None:
            data = (
                body
                if isinstance(body, bytes)
                else json.dumps(body).encode("utf-8")
            )
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        def read_json(self) -> dict[str, Any]:
            length = int(self.headers.get("Content-Length") or 0)
            return json.loads(self.rfile.read(length) or b"{}") if length > 0 else {}

        def dispatch_api(
            self, method: str, path: str, query: dict[str, list[str]]
        ) -> tuple[int, Any]:
            if method == "GET":
                if path == "/api/actors":
                    return controller.get_actors()
                if path == "/api/appointments":
                    return controller.get_appointments(query)

            sub_match = ROUTE_SUB_ITEM.fullmatch(path)
            if sub_match:
                table, rid_str = sub_match.groups()
                return controller.handle_sub_item(
                    method, table, int(rid_str), self.read_json()
                )

            scoped_match = ROUTE_SCOPED.fullmatch(path)
            if scoped_match:
                scope, rid_str, sub = scoped_match.groups()
                body = self.read_json() if method in ("POST", "PUT") else {}
                if not rid_str:
                    return controller.handle_collection(method, scope, body)
                if not sub:
                    return controller.handle_entity(method, scope, int(rid_str), body)
                return controller.handle_entity_sub(
                    method, scope, int(rid_str), sub, body
                )

            return 404, {"error": "not found"}

        def handle_request(self, method: str) -> None:
            try:
                parsed = urlparse(self.path)
                path, query = parsed.path, parse_qs(parsed.query)

                if method == "GET" and not path.startswith("/api/"):
                    static_res = static_service.get_file(path)
                    if static_res:
                        content, content_type = static_res
                        self.send(200, content, content_type)
                        return

                code, response_body = self.dispatch_api(method, path, query)
                self.send(code, response_body)
            except Exception as exc:
                self.send(500, {"error": str(exc)})

        def do_GET(self) -> None:
            self.handle_request("GET")

        def do_POST(self) -> None:
            self.handle_request("POST")

        def do_PUT(self) -> None:
            self.handle_request("PUT")

        def do_DELETE(self) -> None:
            self.handle_request("DELETE")

    return Handler