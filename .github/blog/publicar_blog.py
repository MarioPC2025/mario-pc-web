#!/usr/bin/env python3
"""
publicar_blog.py - publica en el blog las notas programadas cuando llega su fecha y hora.

Lo corre el mismo workflow que Instagram (.github/workflows/instagram-publicar.yml), cada 15 minutos.
Cada nota programada es un archivo .md en .github/blog/cola/ (esa carpeta no se ve en la web), con
este formato:

    ---
    fecha: 2026-12-03 19:00
    slug: identificador-de-la-nota
    title: Título de la nota
    image: blog/portada.jpg
    imageAlt: Descripción de la portada
    excerpt: Resumen corto de la tarjeta.
    ---
    El texto completo, con el mismo formato que en blog-posts.js (## subtítulos, - listas,
    **negrita**, [links](https://...)).

Cuando llega la fecha (hora de Buenos Aires):
  1. Agrega la nota a blog-posts.js (con date = el día de la fecha).
  2. Suma su link a sitemap.xml.
  3. Mueve el .md a .github/blog/publicadas/ (queda como registro).

Variables de entorno: SIMULAR=1 (solo muestra), AHORA="AAAA-MM-DD HH:MM" (para pruebas).
Solo usa la biblioteca estándar de Python.
"""
import json
import os
import re
import shutil
import sys
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, "..", ".."))
COLA = os.path.join(AQUI, "cola")
HECHAS = os.path.join(AQUI, "publicadas")
POSTS = os.path.join(RAIZ, "blog-posts.js")
SITEMAP = os.path.join(RAIZ, "sitemap.xml")
SITE = "https://www.mariopc.com.ar"
TZ = ZoneInfo("America/Argentina/Buenos_Aires")
SIMULAR = os.environ.get("SIMULAR", "") not in ("", "0", "false", "no")
CAMPOS = ("slug", "title", "image", "imageAlt", "excerpt")


def ahora():
    if os.environ.get("AHORA"):
        return datetime.strptime(os.environ["AHORA"], "%Y-%m-%d %H:%M").replace(tzinfo=TZ)
    return datetime.now(timezone.utc).astimezone(TZ)


def leer(path):
    txt = open(path, encoding="utf-8").read().replace("\r\n", "\n")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", txt, re.S)
    if not m:
        raise ValueError("falta el encabezado entre líneas ---")
    meta = {}
    for linea in m.group(1).split("\n"):
        if linea.strip():
            k, _, v = linea.partition(":")
            meta[k.strip()] = v.strip()
    meta["fecha"] = datetime.strptime(meta["fecha"], "%Y-%m-%d %H:%M").replace(tzinfo=TZ)
    for k in ("slug", "title"):
        if not meta.get(k):
            raise ValueError(f"falta '{k}'")
    meta["content"] = m.group(2).strip()
    return meta


def bloque(n):
    """La nota como bloque de blog-posts.js."""
    contenido = n["content"].replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
    lineas = ["    // Nota programada (publicada sola el %s)" % n["fecha"].strftime("%d/%m/%Y %H:%M"), "    {"]
    for k in CAMPOS[:2]:
        lineas.append(f"        {k}: {json.dumps(n[k], ensure_ascii=False)},")
    lineas.append(f'        date: "{n["fecha"]:%Y-%m-%d}",')
    for k in CAMPOS[2:]:
        if n.get(k):
            lineas.append(f"        {k}: {json.dumps(n[k], ensure_ascii=False)},")
    lineas.append(f"        content: `{contenido}`")
    lineas.append("    },")
    return "\n".join(lineas) + "\n\n"


def sumar(n):
    js = open(POSTS, encoding="utf-8").read()
    if re.search(r'slug:\s*"%s"' % re.escape(n["slug"]), js):
        return False  # ya estaba
    m = re.search(r"const blogPosts = \[\n", js)
    if not m:
        raise ValueError("no encontré 'const blogPosts = [' en blog-posts.js")
    js = js[:m.end()] + bloque(n) + js[m.end():]
    open(POSTS, "w", encoding="utf-8").write(js)
    if os.path.exists(SITEMAP):
        sm = open(SITEMAP, encoding="utf-8").read()
        loc = f"{SITE}/blog.html?nota={n['slug']}"
        if loc not in sm and "</urlset>" in sm:
            entrada = f"  <url>\n    <loc>{loc}</loc>\n    <lastmod>{n['fecha']:%Y-%m-%d}</lastmod>\n  </url>\n"
            sm = sm.replace("</urlset>", entrada + "</urlset>")
            open(SITEMAP, "w", encoding="utf-8").write(sm)
    return True


def main():
    if not os.path.isdir(COLA):
        return 0
    t = ahora()
    errores = 0
    for nombre in sorted(os.listdir(COLA)):
        if not nombre.endswith(".md"):
            continue
        path = os.path.join(COLA, nombre)
        try:
            n = leer(path)
        except (ValueError, KeyError) as e:
            print(f"ERROR en {nombre}: {e}", file=sys.stderr)
            errores += 1
            continue
        if n["fecha"] > t:
            print(f"{nombre}: sale el {n['fecha']:%Y-%m-%d %H:%M}.")
            continue
        if SIMULAR:
            print(f"[simulación] publicaría la nota '{n['title']}' ({nombre}).")
            continue
        try:
            nueva = sumar(n)
        except ValueError as e:
            print(f"ERROR en {nombre}: {e}", file=sys.stderr)
            errores += 1
            continue
        os.makedirs(HECHAS, exist_ok=True)
        shutil.move(path, os.path.join(HECHAS, nombre))
        print(("Publicada" if nueva else "Ya estaba publicada") + f": {n['title']} → {SITE}/blog.html?nota={n['slug']}")
    return 1 if errores else 0


if __name__ == "__main__":
    sys.exit(main())
