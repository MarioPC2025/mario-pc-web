# mario-pc-web

Sitio de Mario PC (mariopc.com.ar) — HTML/CSS/JS estático, sin build tools, hosteado en GitHub Pages. Todo se edita directo desde la web de GitHub.

Estas instrucciones vivían antes como comentarios dentro de los archivos HTML. Se movieron acá para que no queden visibles en el código público del sitio.

## Agregar un caso a la galería antes/después (`index.html`)

1. Subí las dos fotos (antes y después) a la carpeta `/gallery` del repo (Add file → Upload files). Nombralas simple, sin espacios: `notebook1-antes.jpg`, `notebook1-despues.jpg`.
2. En `index.html`, buscá `const galleryItems = [` y agregá una línea:
   ```js
   { before: "gallery/notebook1-antes.jpg", after: "gallery/notebook1-despues.jpg", caption: "Notebook con pantalla rota" },
   ```
3. Commit. La tarjeta se arma sola; mientras el array esté vacío se muestra el cartel "Próximamente".

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

## Publicar una nota de blog (`blog.html`)

1. Si tiene foto de portada, subila a `/blog` (mismo método que `/gallery` e `/instagram`).
2. Buscá `const blogPosts = [` y agregá:
   ```js
   {
       title: "Título de la nota",
       date: "10 de julio, 2026",
       image: "blog/nombre-foto.jpg", // opcional, sacar la línea si no hay foto
       content: "El texto completo. Dejá una línea en blanco entre párrafos."
   },
   ```
3. Commit. El cartel de "Muy pronto" desaparece solo apenas hay un post cargado.

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
