#!/usr/bin/env python3
"""
publicar.py - publica en Instagram (@mariopc.com.ar) los posts aprobados de la cola.

Lo corre GitHub Actions cada 15 minutos (.github/workflows/instagram-publicar.yml).
La cola es .github/instagram/cola.json: cada publicación que entra a la rama main ya está
aprobada por Mario (llega por un Pull Request que él revisa y une).

Qué hace en cada vuelta:
  1. Lee la cola. Si "pausado" es true, no hace nada.
  2. Busca publicaciones "pendiente" cuya fecha y hora (Buenos Aires) ya llegaron.
  3. Comprueba que las imágenes ya estén publicadas en la web (Instagram las baja de ahí).
  4. Crea los contenedores en la API de Instagram, espera a que estén listos y publica.
  5. Marca la publicación como "publicado" con su link, y la suma al carrusel de Instagram de la
     home (index.html), arriba de todo.

Dos formas de conexión con Instagram (la de Mario PC es la de Facebook):
  - Inicio de sesión con Facebook: "ig_user_id" en cola.json (o IG_USER_ID) con el id de la cuenta
    profesional de Instagram, e IG_TOKEN = clave de la página de Facebook vinculada (no vence).
    Usa https://graph.facebook.com.
  - Inicio de sesión con Instagram: sin "ig_user_id"; IG_TOKEN = clave de Instagram (vence a los 60
    días). Usa https://graph.instagram.com.

Variables de entorno:
  IG_TOKEN          clave de acceso (secret del repo). Obligatoria salvo en simulación.
  IG_USER_ID        id de la cuenta de Instagram (si no está, se toma "ig_user_id" de cola.json)
  IG_API_BASE       por defecto graph.facebook.com con IG_USER_ID, o graph.instagram.com sin él
  IG_API_VERSION    por defecto v26.0
  SITE_URL          por defecto https://www.mariopc.com.ar
  SIMULAR=1         muestra lo que haría, sin llamar a Instagram ni cambiar archivos.
  MAX_ATRASO_HORAS  por defecto 48: una publicación más atrasada que esto no sale sola (avisa).
  AHORA             (solo para pruebas) fecha y hora a usar como "ahora", formato AAAA-MM-DD HH:MM.

Solo usa la biblioteca estándar de Python.
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, "..", ".."))
COLA = os.path.join(AQUI, "cola.json")
INDEX = os.path.join(RAIZ, "index.html")
TZ = ZoneInfo("America/Argentina/Buenos_Aires")

API = os.environ.get("IG_API_BASE", "https://graph.instagram.com").rstrip("/")
VER = os.environ.get("IG_API_VERSION", "v26.0")
SITE = os.environ.get("SITE_URL", "https://www.mariopc.com.ar").rstrip("/")
TOKEN = os.environ.get("IG_TOKEN", "")
SIMULAR = os.environ.get("SIMULAR", "") not in ("", "0", "false", "no")
MAX_ATRASO = timedelta(hours=float(os.environ.get("MAX_ATRASO_HORAS", "48")))


class ErrorPublicacion(Exception):
    pass


def log(msg):
    print(msg, flush=True)


def ahora():
    if os.environ.get("AHORA"):
        return datetime.strptime(os.environ["AHORA"], "%Y-%m-%d %H:%M").replace(tzinfo=TZ)
    return datetime.now(timezone.utc).astimezone(TZ)


def api(metodo, ruta, datos=None):
    """Llama a la API de Instagram. Devuelve el JSON de respuesta o lanza ErrorPublicacion."""
    params = dict(datos or {})
    params["access_token"] = TOKEN
    url = f"{API}/{VER}/{ruta.lstrip('/')}"
    cuerpo = None
    if metodo == "GET":
        url += "?" + urllib.parse.urlencode(params)
    else:
        cuerpo = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(url, data=cuerpo, method=metodo)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        detalle = e.read().decode(errors="replace")
        try:
            detalle = json.loads(detalle).get("error", {}).get("message", detalle)
        except ValueError:
            pass
        raise ErrorPublicacion(f"Instagram respondió {e.code} en {metodo} {ruta}: {detalle}")
    except urllib.error.URLError as e:
        raise ErrorPublicacion(f"No se pudo conectar con Instagram ({e.reason})")


def imagen_publica(ruta):
    """La URL pública de una imagen del repo, y si ya responde (la web tarda un poco en publicarse)."""
    url = f"{SITE}/{ruta.lstrip('/')}"
    req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "mariopc-publicador"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            tipo = r.headers.get("Content-Type", "")
            return url, r.status == 200 and "image/jpeg" in tipo
    except (urllib.error.HTTPError, urllib.error.URLError):
        return url, False


def esperar_contenedor(cid):
    """Espera a que Instagram termine de procesar un contenedor (hasta 5 minutos)."""
    for _ in range(20):
        estado = api("GET", cid, {"fields": "status_code"}).get("status_code")
        if estado == "FINISHED":
            return
        if estado in ("ERROR", "EXPIRED"):
            raise ErrorPublicacion(f"Instagram no pudo procesar el contenedor {cid} (estado {estado})")
        time.sleep(15)
    raise ErrorPublicacion(f"El contenedor {cid} no quedó listo en 5 minutos")


def publicar(ig_id, p, urls):
    if p["tipo"] == "post":
        cont = api("POST", f"{ig_id}/media", {"image_url": urls[0], "caption": p["epigrafe"]})["id"]
    elif p["tipo"] == "carrusel":
        if not 2 <= len(urls) <= 20:
            raise ErrorPublicacion(f"Un carrusel lleva de 2 a 20 imágenes ({p['id']} tiene {len(urls)})")
        hijos = []
        for u in urls:
            h = api("POST", f"{ig_id}/media", {"image_url": u, "is_carousel_item": "true"})["id"]
            esperar_contenedor(h)
            hijos.append(h)
        cont = api("POST", f"{ig_id}/media", {"media_type": "CAROUSEL", "children": ",".join(hijos),
                                               "caption": p["epigrafe"]})["id"]
    else:
        raise ErrorPublicacion(f"Tipo desconocido en {p['id']}: {p['tipo']} (usá post o carrusel)")
    esperar_contenedor(cont)
    media_id = api("POST", f"{ig_id}/media_publish", {"creation_id": cont})["id"]
    link = api("GET", media_id, {"fields": "permalink"}).get("permalink", "")
    return media_id, link


def sumar_a_la_web(imagen, link):
    """Agrega el post arriba de todo en el carrusel de Instagram de la home."""
    if not os.path.exists(INDEX) or not link:
        return False
    html = open(INDEX, encoding="utf-8").read()
    if link in html:
        return False
    m = re.search(r"(const instagramPosts = \[\n)(\s*)", html)
    if not m:
        log("Aviso: no encontré 'const instagramPosts = [' en index.html; la web no se actualizó.")
        return False
    linea = f'{m.group(2)}{{ image: "{imagen}", url: "{link}" }},\n'
    html = html[:m.end(1)] + linea + html[m.end(1):]
    open(INDEX, "w", encoding="utf-8").write(html)
    return True


def main():
    global API
    cola = json.load(open(COLA, encoding="utf-8"))
    ig_user = str(os.environ.get("IG_USER_ID") or cola.get("ig_user_id") or "").strip()
    if ig_user and "IG_API_BASE" not in os.environ:
        API = "https://graph.facebook.com"
    if cola.get("pausado"):
        log("La cola está en pausa (\"pausado\": true). No publico nada.")
        return 0
    if SIMULAR and TOKEN:
        # Prueba de la clave sin publicar nada (para el botón "Run workflow" con la casilla marcada).
        if ig_user:
            cuenta = api("GET", ig_user, {"fields": "username"})
            log(f"Clave OK: conectada a @{cuenta.get('username')} (id {ig_user}).")
        else:
            cuenta = api("GET", "me", {"fields": "user_id,username"})
            log(f"Clave OK: conectada a @{cuenta.get('username')} (id {cuenta.get('user_id')}).")
    t = ahora()
    pendientes = []
    errores = []
    for p in cola["publicaciones"]:
        if p.get("estado", "pendiente") != "pendiente":
            continue
        cuando = datetime.strptime(p["fecha"], "%Y-%m-%d %H:%M").replace(tzinfo=TZ)
        if cuando > t:
            continue
        if t - cuando > MAX_ATRASO:
            log(f"{p['id']}: estaba para el {p['fecha']} y ya pasaron más de "
                f"{MAX_ATRASO.total_seconds() / 3600:.0f} horas. No sale sola: cambiá la fecha en la cola.")
            p["estado"] = "atrasado"
            errores.append(f"{p['id']}: quedó atrasada (era para el {p['fecha']}); no se publicó sola")
            continue
        pendientes.append(p)

    if not pendientes:
        log(f"{t:%Y-%m-%d %H:%M}: no hay nada para publicar ahora.")
        guardar(cola)
        if errores:
            print("\n".join(errores), file=sys.stderr)
            return 1
        return 0

    if not SIMULAR and not TOKEN:
        raise ErrorPublicacion("Falta el secret IG_TOKEN en el repositorio.")

    ig_id = ig_user or None
    for p in pendientes:
        try:
            urls = []
            for ruta in p["imagenes"]:
                url, ok = imagen_publica(ruta)
                if not ok and not SIMULAR:
                    raise ErrorPublicacion(f"La imagen todavía no está en la web: {url}")
                urls.append(url)
            if SIMULAR:
                log(f"[simulación] publicaría {p['id']} ({p['tipo']}, {len(urls)} imagen/es):\n  "
                    + "\n  ".join(urls) + f"\n  epígrafe: {p['epigrafe'][:80]}...")
                continue
            if ig_id is None:
                ig_id = api("GET", "me", {"fields": "user_id,username"})["user_id"]
            media_id, link = publicar(ig_id, p, urls)
            p.update(estado="publicado", media_id=media_id, link=link,
                     publicado_el=f"{ahora():%Y-%m-%d %H:%M}")
            p.pop("error", None)
            log(f"Publicado {p['id']}: {link}")
            if cola.get("sumar_a_la_web", True) and sumar_a_la_web(p["imagenes"][0], link):
                log("  Sumado al carrusel de Instagram de la home.")
        except ErrorPublicacion as e:
            p["error"] = str(e)
            p["intentos"] = p.get("intentos", 0) + 1
            if p["intentos"] >= 3:
                p["estado"] = "error"
            errores.append(f"{p['id']}: {e}")
            log(f"ERROR en {p['id']}: {e}")
    if not SIMULAR:
        guardar(cola)
    if errores:
        print("\n".join(errores), file=sys.stderr)
        return 1
    return 0


def guardar(cola):
    if SIMULAR:
        return
    with open(COLA, "w", encoding="utf-8") as fh:
        json.dump(cola, fh, ensure_ascii=False, indent=2)
        fh.write("\n")


if __name__ == "__main__":
    try:
        sys.exit(main())
    except ErrorPublicacion as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
