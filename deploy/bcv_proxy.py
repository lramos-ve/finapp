#!/usr/bin/env python3
"""Proxy mínimo que lee USD y EUR oficiales directo de bcv.org.ve.

Escucha en 127.0.0.1:8100 y responde GET /api/bcv con JSON.
Valida TLS con ca-bundle.pem (CA del sistema + intermedio Sectigo, que el BCV no envía).
"""
import json
import re
import ssl
import threading
import time
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

URL = "https://www.bcv.org.ve/"
BUNDLE = str(Path(__file__).with_name("ca-bundle.pem"))
TTL = 600  # segundos de caché
HOST, PORT = "127.0.0.1", 8100

_ctx = ssl.create_default_context(cafile=BUNDLE)
_lock = threading.Lock()
_cache = {"data": None, "ts": 0.0}


def _tasa(html, ident):
    m = re.search(
        r'id="%s".*?<strong[^>]*>\s*([\d.]+,\d+)\s*</strong>' % ident, html, re.S
    )
    if not m:
        raise ValueError("no se encontró la tasa de " + ident)
    valor = float(m.group(1).replace(".", "").replace(",", "."))
    if not 0.1 < valor < 1_000_000:
        raise ValueError("tasa fuera de rango para " + ident)
    return valor


def consultar():
    req = urllib.request.Request(URL, headers={"User-Agent": "finapp-bcv-proxy/1.0"})
    with urllib.request.urlopen(req, timeout=15, context=_ctx) as r:
        html = r.read().decode("utf-8", "replace")
    fecha = re.search(r'Fecha Valor:\s*<span[^>]*content="([^"]+)"', html)
    return {
        "usd": _tasa(html, "dolar"),
        "eur": _tasa(html, "euro"),
        "fechaValor": fecha.group(1) if fecha else None,
        "fuente": "bcv.org.ve",
    }


def obtener():
    with _lock:
        if _cache["data"] and time.time() - _cache["ts"] < TTL:
            return _cache["data"]
        try:
            _cache["data"] = consultar()
            _cache["ts"] = time.time()
        except Exception:
            if not _cache["data"]:
                raise
        return _cache["data"]


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.split("?")[0] != "/api/bcv":
            self.send_error(404)
            return
        try:
            body, code = json.dumps(obtener()).encode(), 200
        except Exception as e:  # noqa: BLE001
            body, code = json.dumps({"error": str(e)}).encode(), 502
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "public, max-age=300")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
