#!/usr/bin/env python3
"""
renovar_token.py - renueva la clave de Instagram antes de que venza (dura 60 días).

Lo corre GitHub Actions una vez por semana (.github/workflows/instagram-token.yml). Pide una clave
nueva a Instagram y la deja en el archivo indicado por NUEVO_TOKEN_EN, para que el workflow la
guarde como secret IG_TOKEN. Nunca la imprime.

Variables: IG_TOKEN (la clave actual), NUEVO_TOKEN_EN (ruta del archivo de salida),
IG_API_BASE (por defecto https://graph.instagram.com).
"""
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

API = os.environ.get("IG_API_BASE", "https://graph.instagram.com").rstrip("/")
token = os.environ.get("IG_TOKEN", "")
salida = os.environ.get("NUEVO_TOKEN_EN", "")
if not token or not salida:
    sys.exit("Faltan IG_TOKEN o NUEVO_TOKEN_EN.")

url = f"{API}/refresh_access_token?" + urllib.parse.urlencode(
    {"grant_type": "ig_refresh_token", "access_token": token})
try:
    with urllib.request.urlopen(url, timeout=60) as r:
        datos = json.loads(r.read().decode())
except urllib.error.HTTPError as e:
    detalle = e.read().decode(errors="replace")
    try:
        detalle = json.loads(detalle).get("error", {}).get("message", detalle)
    except ValueError:
        pass
    sys.exit(f"Instagram no renovó la clave ({e.code}): {detalle}")

nuevo = datos.get("access_token")
if not nuevo:
    sys.exit("La respuesta de Instagram no trae una clave nueva.")
with open(salida, "w") as fh:
    fh.write(nuevo)
dias = int(datos.get("expires_in", 0)) // 86400
print(f"Clave renovada: vale por {dias} días más.")
