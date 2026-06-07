from functools import partial
from http.server import SimpleHTTPRequestHandler
from pathlib import Path
from socketserver import ThreadingTCPServer


ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = 8765


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        return


class ReusableServer(ThreadingTCPServer):
    allow_reuse_address = True


def main():
    handler = partial(QuietHandler, directory=str(ROOT))
    with ReusableServer((HOST, PORT), handler) as server:
        print("Serving Global Holocene Volcanoes Web Map", flush=True)
        print(f"Folder: {ROOT}", flush=True)
        print(f"Open: http://localhost:{PORT}", flush=True)
        print("", flush=True)
        print("Press Ctrl+C to stop the server.", flush=True)
        server.serve_forever()


if __name__ == "__main__":
    main()
