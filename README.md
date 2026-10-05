# mario-pc-web

Sitio de Mario PC (mariopc.com.ar) — HTML/CSS/JS estático, sin build tools, hosteado en GitHub Pages. Todo se edita directo desde la web de GitHub.

Estas instrucciones vivían antes como comentarios dentro de los archivos HTML. Se movieron acá para que no queden visibles en el código público del sitio.

## Agregar una publicación de Instagram (`index.html`)

1. Subí la foto a la carpeta `/instagram` del repo.
2. Buscá `const instagramPosts = [` y agregá:
   ```js
   { image: "instagram/post1.jpg", url: "https://www.instagram.com/p/XXXXXXXXX/" },
   ```
   El `url` se copia desde la app (Compartir → Copiar enlace).

## Actualizar el link de reseñas de Google (`index.html`)

La sección de opiniones apunta al perfil de Google Maps. En el Google Business Profile hay una opción "Obtener más reseñas" que da un link corto directo al cuadro de escribir reseña (mejor que el link genérico de Maps). Reemplazar el `href` del botón "Dejar una reseña" en la sección `#opiniones` por ese link corto cuando se consiga.

## Agregar un testimonio (`index.html`)

Cuando un cliente escriba algo lindo por WhatsApp, buscá `const testimonials = [` y agregá:
```js
{ text: "El texto tal cual te lo escribieron o un resumen fiel.", author: "Nombre — Barrio" },
```
Se puede usar nombre completo, solo el nombre, o "Nombre + inicial" para más privacidad. Mientras el array esté vacío se muestra el cartel de "Próximamente".

## Publicar una nota de blog (`blog-posts.js`)

Las notas se cargan **solo** en `blog-posts.js`. De ahí salen las tarjetas de la home (las 3 más nuevas), el listado de `blog.html` y cada nota completa. No hay que tocar ningún otro archivo.

1. Si la nota tiene foto de portada, subila a la carpeta `/blog` del repo (Add file → Upload files). Nombre simple y sin espacios, ej: `ssd-post.jpg`. Mejor en horizontal (16:9) y liviana (idealmente menos de 300 KB).
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

El cartel de abierto/cerrado de la home y el aviso "Cerrado ahora" junto al botón flotante de WhatsApp (en home, empresas, faq y blog) siguen solos el horario normal. La lógica está en `horario.js`. Para pisarla (feriado, imprevisto, vacaciones) se edita el archivo `status.json` de la raíz del repo, sin tocar ninguna página.

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

     Si escribís algo, se muestra tal cual (máx. 120 caracteres). El aviso del botón de WhatsApp no cambia: siempre dice "Cerrado ahora · Escribime y te respondo apenas abra".
3. Commit. A los 1–2 minutos recargá el sitio y verificá que el cartel cambió.

**Cómo reabrir antes de tiempo:** poné `"cerrado": false` y commit.

**Feriados:** la lista `feriados` ya cierra el local sola esos días (fechas `AAAA-MM-DD`, entre comillas y separadas por coma, sin coma después de la última). Cargarla una vez por año, en diciembre. Los feriados que caen sábado o domingo no hacen falta. Los días no laborables optativos (ej. puentes turísticos) o provinciales se agregan solo si decidís cerrar.

**Si algo se rompe:** si `status.json` tiene un error de sintaxis (una coma de más, una comilla que falta) o no carga, el sitio ignora todo y usa el horario normal. Nunca queda trabado en "cerrado".

**Cambiar los horarios de atención:** en `horario.js`, función `scheduleFor` (los horarios están en minutos: `10 * 60` = 10:00, `17 * 60` = 17:00). Además hay que actualizar a mano la tabla de horarios de la sección ubicación en `index.html`.
