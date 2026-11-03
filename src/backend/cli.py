import argparse
import webbrowser
from http.server import ThreadingHTTPServer
from pathlib import Path

from backend.config import (
    DEFAULT_DB_PATH,
    DEFAULT_HOST,
    DEFAULT_PORT,
    SCHEMA_PATH,
    STATIC_DIR,
)
from backend.db.engine import SQLiteEngine
from backend.db.repository import MainRepository
from backend.http_handler import make_handler
from backend.main_controller import MainController
from backend.static_service import StaticFileService


def main() -> None:
    parser = argparse.ArgumentParser(description="Serveur local Bulogenda")
    parser.add_argument("--host", default=DEFAULT_HOST, help="Adresse d'écoute")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help="Port d'écoute")
    parser.add_argument(
        "--db", type=Path, default=DEFAULT_DB_PATH, help="Chemin du fichier SQLite"
    )
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Ne pas ouvrir le navigateur automatiquement",
    )
    args = parser.parse_args()

    engine = SQLiteEngine(args.db, SCHEMA_PATH)
    repo = MainRepository(engine)
    controller = MainController(repo)
    static_service = StaticFileService(STATIC_DIR)

    server = ThreadingHTTPServer(
        (args.host, args.port), make_handler(controller, static_service)
    )
    url = f"http://{args.host}:{args.port}"
    print(f"Bulogenda démarré sur {url} (Base : {args.db})")

    if not args.no_browser:
        webbrowser.open(url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nArrêt du serveur.")
        server.server_close()


if __name__ == "__main__":
    main()