# mario-pc-web

Sitio de Mario PC (mariopc.com.ar): HTML/CSS/JS estático, sin build tools, hosteado en GitHub Pages. Todo se edita directo desde la web de GitHub.

Estas instrucciones vivían antes como comentarios dentro de los archivos HTML. Se movieron acá para que no queden visibles en el código público del sitio.

## Cómo está armado

- `site.css` y `site.js`: lo que comparten todas las páginas (colores, letras, botones, menú, pie, WhatsApp flotante y volver arriba). Si cambiás el menú o el pie, cambialo en las 4 páginas que lo tienen: `index.html`, `faq.html`, `empresas.html` y `blog.html`.
- `theme.css` y `theme.js`: el modo claro y su botón.
- `horario.js`: el cartel de abierto/cerrado y los feriados (que se leen de `status.json`).
- Lo propio de cada página está en su `<style>`.
- `DESIGN.md`: el sistema visual y la voz, para que los cambios nuevos sigan el mismo estilo.

## Cambiar un precio (`index.html`)

Buscá el nombre del servicio (por ejemplo `Formateo e instalación`) y cambiá el número que está en `<b>$65.000</b>`. Diagnóstico y SSD son los dos destacados de arriba; el resto está en la lista de abajo.

## Agregar una publicación de Instagram (`index.html`)

> Desde noviembre 2026 los posts nuevos se publican solos desde la cola (`.github/instagram/cola.json`) y se suman a la home automáticamente. Ver `.github/instagram/LEEME.md`. Esto queda para sumar a mano un post que se haya subido por fuera de la cola.

1. Subí la foto a la carpeta `/instagram` del repo. Formato vertical 4:5, de 720×900 (si sale de Instagram a 1080×1350, achicala antes: en la web se ve a unos 280 px de ancho y así pesa menos de 90 KB).
2. Buscá `const instagramPosts = [` y agregá la publicación **arriba de todo** (la primera de la lista es la que se ve primero):
   ```js
   { image: "instagram/post1.jpg", url: "https://www.instagram.com/p/XXXXXXXXX/" },
   ```
   El `url` se copia desde la app (Compartir → Copiar enlace).

En la home se muestran todas en un carrusel de una sola fila (con flechas en la compu y deslizando con el dedo en el celular), así que la página no se alarga al sumar publicaciones.

## Actualizar el link de reseñas de Google (`index.html`)

La sección de opiniones apunta al perfil de Google Maps. En el Google Business Profile hay una opción "Obtener más reseñas" que da un link corto directo al cuadro de escribir reseña (mejor que el link genérico de Maps). Reemplazar el `href` del botón "Dejar una reseña" en la sección `#opiniones` por ese link corto cuando se consiga.

## Agregar un testimonio (`index.html`)

Cuando un cliente escriba algo lindo por WhatsApp, buscá `const testimonials = [` y agregá:
```js
{ text: "El texto tal cual te lo escribieron o un resumen fiel.", author: "Nombre · Barrio", stars: 5 },
```
- `stars` es la cantidad de estrellas, de 1 a 5. Si no lo ponés, muestra 5.
- Se puede usar nombre completo, solo el nombre, o "Nombre + inicial" para más privacidad.
- Las reseñas se muestran en un carrusel de una fila. Las flechas aparecen solas cuando hay más reseñas de las que entran en pantalla (en la compu entran 3).
- Mientras la lista esté vacía, solo se ve el botón para dejar una reseña en Google.

## Publicar una nota de blog (`blog-posts.js`)

Las notas se cargan **solo** en `blog-posts.js`. De ahí salen las tarjetas de la home (todas, en un carrusel de una fila, la más nueva primero), el listado de `blog.html` y cada nota completa. No hay que tocar ningún otro archivo.

1. Si la nota tiene foto de portada, subila a la carpeta `/blog` del repo (Add file → Upload files). Nombre simple y sin espacios, ej: `ssd-post.jpg`. Mejor en horizontal (16:9), de 1200×675 y liviana (idealmente menos de 80 KB).
2. Abrí `blog-posts.js` → lápiz (Edit), buscá `const blogPosts = [` y agregá un bloque entre las llaves cuadradas, **separado del anterior por una coma**:
   ```js
   {
       slug: "como-saber-si-tu-pc-necesita-un-ssd",
       title: "Cómo saber si tu PC necesita un SSD",
       date: "2026-10-10",
       image: "blog/ssd-post.jpg",
       imageAlt: "Disco SSD sobre una mesa de trabajo",
       excerpt: "Resumen corto que se ve en la tarjeta (1 o 2 frases).",
       content: `El texto completo de la nota.

   Una línea en blanco separa los párrafos.

   ## Un subtítulo

   - Un punto de lista
   - Otro punto de lista

   Podés usar **negrita** y [un link](https://www.mariopc.com.ar).`
   },
   ```
3. Commit. A los 1–2 minutos la nota aparece sola en el blog y, si es de las 3 más nuevas, en la home.

Al final de cada nota se agrega solo un recuadro con el botón de WhatsApp, el diagnóstico sin cargo, el precio antes de arrancar y la garantía de 7 días (está en `blog-lib.js`). No hace falta repetirlo en el texto: cerrá la nota con lo propio del tema y, si querés, un link de WhatsApp con un mensaje armado para esa nota.

**Campos**

| Campo | ¿Obligatorio? | Qué es |
|---|---|---|
| `title` | Sí | Título de la nota. |
| `content` | Sí | Texto completo (ver formato abajo). |
| `date` | Recomendado | Formato `AAAA-MM-DD`. Con eso se ordena (la más nueva primero) y se muestra como "10 de octubre, 2026". Si lo escribís de otra forma se muestra tal cual y la nota va al final. |
| `slug` | Recomendado | Identificador del link: la nota queda en `blog.html?nota=ese-identificador`. Sin tildes, en minúsculas y con guiones. Si no lo ponés se arma con el título, pero entonces **cambiar el título después cambia el link** y se rompen los links ya compartidos. |
| `excerpt` | No | Resumen de la tarjeta. Si falta, se arma solo con el comienzo del texto (conviene escribirlo a mano). |
| `image` | No | Portada. Se ve en la tarjeta y arriba de la nota. Si no hay, la tarjeta muestra un ícono y la nota va sin foto. |
| `imageAlt` | No | Descripción de la portada (accesibilidad y SEO). Si falta se usa el título. |
| `updated` | No | Fecha `AAAA-MM-DD` de la última actualización, si editás una nota ya publicada. |

**Formato del texto (`content`)**

- Va entre acentos graves (`` ` ``), no entre comillas, así se pueden escribir varias líneas. Evitá escribir un acento grave o `${` dentro del texto.
- Una línea en blanco separa párrafos.
- `## Subtítulo` y `### Subtítulo menor` en su propia línea.
- `- ` al inicio de la línea arma una lista.
- `**negrita**` y `[texto del link](https://...)`. Para linkear otra página del sitio: `[texto](empresas.html)`.
- Cualquier otro símbolo (como `<` o `>`) se muestra tal cual, no se interpreta como HTML.

**Foto del autor.** Arriba de `blog-posts.js` está `AUTHOR` (nombre, descripción y foto). Subí una foto cuadrada (ej. 400×400) a `/blog/mario.jpg`. Si el archivo no existe se muestra un círculo con la inicial, así que no se rompe nada.

**Sitemap (recomendado).** Para que Google descubra cada nota, sumá en `sitemap.xml`, antes de `</urlset>`:
```xml
  <url>
    <loc>https://www.mariopc.com.ar/blog.html?nota=ese-identificador</loc>
    <lastmod>2026-10-10</lastmod>
  </url>
```

**Cómo funciona por dentro.** `blog-posts.js` es solo datos (lo único que se edita). `blog-lib.js` tiene la lógica (tarjetas, nota completa, schema `BlogPosting`) y no se toca. Si por un error de tipeo `blog-posts.js` queda mal, el resto del sitio sigue andando y simplemente no se muestran notas.

**Limitaciones conocidas.** Las notas se arman con JavaScript sobre `blog.html`. Google las lee, pero puede tardar más que con una página propia por nota. Además, al compartir el link de una nota por WhatsApp o Facebook, la vista previa muestra el título y la imagen genéricos del blog, porque esas apps no ejecutan JavaScript. Si el blog empieza a rendir, el siguiente paso es una página HTML por nota.

**Casos "antes y después".** La sección de la home y la carpeta `/gallery` ya no se usan (se puede borrar la carpeta). Un caso antes/después se publica como una nota más, con la foto del después como portada y las dos fotos dentro del texto.

## Cartel de horario y cierres manuales (`horario.js` + `status.json`)

El cartel de abierto/cerrado de la home y los avisos del botón flotante de WhatsApp (en home, empresas, faq y blog) siguen solos el horario normal. Cuando está cerrado, el botón muestra unas "Z" animadas (está "durmiendo"); en la compu el aviso aparece unos segundos al entrar y después al pasar el mouse, y en el celular aparece al tocar el botón, con un botón "Escribir igual" que abre WhatsApp. La lógica está en `horario.js`. Para pisarla (feriado, imprevisto, vacaciones) se edita el archivo `status.json` de la raíz del repo, sin tocar ninguna página.

**Cómo cerrar:**

1. En GitHub, abrí `status.json` → lápiz (Edit).
2. Cambiá los valores:
   ```json
   {
     "cerrado": true,
     "hasta": "2026-10-06",
     "mensaje": "",
     "feriados": [ ...no tocar... ]
   }
   ```
   - `"cerrado": true` activa el cierre.
   - `"hasta"` es **obligatorio** y dice cuándo termina el cierre. Hora de Argentina. Hay dos formas:
     - **Por días:** `"2026-10-06"` → cerrado todo ese día (incluido) y al día siguiente reabre. Para varios días, poné el último día de cierre.
     - **Por horas:** `"2026-10-06 14:00"` → cerrado hasta esa hora, y a las 14:00 el sitio vuelve solo al horario normal. Formato `AAAA-MM-DD HH:MM`, hora en 24 h.
   - Si dejás `hasta` vacío o mal escrito, el cierre **no se aplica**.
   - `"mensaje"` es opcional y cambia el texto del cartel de la home. Vacío, el cartel se arma solo:
     - por días: "Cerrado temporalmente · Abro mañana a las 10:00"
     - por horas: "Cerrado temporalmente · Vuelvo hoy a las 14:00" (o "Abro mañana a las 10:00" si la hora cae después del cierre)

     Si escribís algo, se muestra tal cual (máx. 120 caracteres). El aviso del botón de WhatsApp no usa este mensaje: dice cuándo vuelvo (ej. "Abro mañana a las 10:00") y "Escribime y te respondo apenas abra".
3. Commit. A los 1–2 minutos recargá el sitio y verificá que el cartel cambió.

**Cómo reabrir antes de tiempo:** poné `"cerrado": false` y commit.

**Feriados:** la lista `feriados` ya cierra el local sola esos días (fechas `AAAA-MM-DD`, entre comillas y separadas por coma, sin coma después de la última). Cargarla una vez por año, en diciembre. Los feriados que caen sábado o domingo no hacen falta. Los días no laborables optativos (ej. puentes turísticos) o provinciales se agregan solo si decidís cerrar.

**Si algo se rompe:** si `status.json` tiene un error de sintaxis (una coma de más, una comilla que falta) o no carga, el sitio ignora todo y usa el horario normal. Nunca queda trabado en "cerrado".

**Cambiar los horarios de atención:** en `horario.js`, función `scheduleFor` (los horarios están en minutos: `10 * 60` = 10:00, `17 * 60` = 17:00). Además hay que actualizar a mano la tabla de horarios de la sección de contacto en `index.html`.

## Estado de tu equipo (`estado.html` + `estado.js`)

Página donde el cliente ve en qué anda su equipo con el código de su comprobante (`mariopc.com.ar/estado#ABCD-EFGH-JKMN`). Los datos los sube la app del taller a un Worker de Cloudflare; el código del Worker y el detalle de seguridad están en el repo `mario-pc-app` (carpeta `portal/` y su README).

- El código va después del `#`, así que no llega a ningún servidor por la dirección. `estado.js` lo manda en el cuerpo de un POST.
- La página no tiene Google Analytics, no manda referer y tiene su propia CSP: solo se conecta a este sitio y al Worker.
- Tiene `noindex` y no está en el `sitemap.xml`. Se llega desde el QR, desde el pie de las páginas ("¿Dejaste tu equipo? Mirá cómo va") y desde la última pregunta del FAQ.
- **Si cambia la dirección del Worker**, hay que cambiarla en dos lugares: `API` en `estado.js` y `connect-src` en la CSP de `estado.html`.
- **Si cambiás el script chico del `<head>` de `estado.html`** (el que aplica el modo claro), hay que recalcular su hash `sha256-…` en la CSP; si no, el navegador lo bloquea.
- Para probarla en la compu, la página usa el Worker local (`http://127.0.0.1:8787`) cuando se abre desde `localhost`.

## Modo claro (`theme.css` + `theme.js` + `flashbang.mp3`)

El sitio arranca siempre en oscuro. El botón de sol/luna (en la barra de arriba, o flotando arriba a la derecha en `gracias.html` y `404.html`) cambia de tema y la elección queda guardada en el navegador del visitante.

- **Colores del modo claro:** están todos juntos al principio de `theme.css`. Los del modo oscuro siguen en el `:root` de cada página.
- **Sonido:** `flashbang.mp3` suena la primera vez que alguien pasa a claro en cada visita; el de alivio (al volver a oscuro) se genera por código. El volumen está en `VOLUME` dentro de `theme.js` (0.3 = 30%).
- **Avisos:** los textos "Ojo con el brillo" y "Ahh, mucho mejor." están en `theme.js`.
- Si alguien tiene activado "reducir movimiento" en su sistema, el tema cambia sin destello ni sonido.
- Si cambiás `theme.css` o `theme.js`, subí el `?v=1` de las páginas a `?v=2` para que los navegadores bajen la versión nueva.
- Colores nuevos en una página: usá las variables (`var(--white)`, `var(--muted)`, `rgba(var(--ink-rgb), 0.05)`, etc.) en lugar de colores fijos, así funcionan en los dos modos.
