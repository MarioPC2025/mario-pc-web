# Notas del blog programadas · Mario PC

Las notas de esta carpeta se publican solas en el blog cuando llega su fecha y hora, igual que los
posts de Instagram de `.github/instagram/`. No hace falta ninguna compu encendida.

## Cómo funciona

1. Claude escribe las notas del mes y las deja en `cola/`, en el mismo Pull Request que los posts de
   Instagram del mes. **Unir el PR = aprobar** las notas y los posts.
2. Cada 15 minutos, el workflow "Instagram · publicar" (pestaña Actions) corre
   `publicar_blog.py`: si una nota ya tiene fecha, la agrega a `blog-posts.js`, suma su link a
   `sitemap.xml` y mueve el archivo a `publicadas/`.
3. La portada (`image`) ya tiene que estar en la carpeta `/blog` del repo: viene en el mismo PR.
4. Si algo falla, se abre un aviso (issue) con la etiqueta `blog` y te llega un mail.

Como el post de Instagram de cada nota sale media hora después (19:30), cuando alguien toca "link en
la bio" la nota ya está en la web.

## Formato de cada nota (`cola/AAAA-MM-DD-algo.md`)

```
---
fecha: 2026-12-03 19:00
slug: identificador-de-la-nota
title: Título de la nota
image: blog/portada.jpg
imageAlt: Descripción de la portada
excerpt: Resumen corto que se ve en la tarjeta.
---
El texto completo. Mismo formato que en blog-posts.js: línea en blanco entre párrafos,
## subtítulos, - listas, **negrita** y [links](https://...).
```

- `fecha` es hora de Buenos Aires, formato `AAAA-MM-DD HH:MM`. La nota queda fechada ese día.
- `slug` es el final del link (`blog.html?nota=slug`): sin tildes, minúsculas y guiones. No lo
  cambies después de publicada.

## Cosas que se pueden hacer a mano

- **Cambiar la fecha:** editá `fecha` en el archivo de `cola/`.
- **Corregir el texto antes de que salga:** editá el archivo de `cola/`.
- **Corregir una nota ya publicada:** se edita en `blog-posts.js`, como cualquier nota.
- **Que no salga:** borrá el archivo de `cola/` (o movelo a otra carpeta).
- **Probar sin publicar:** Actions → "Instagram · publicar" → Run workflow con la casilla "Solo
  mostrar qué publicaría" marcada.
