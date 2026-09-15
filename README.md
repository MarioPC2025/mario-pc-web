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
