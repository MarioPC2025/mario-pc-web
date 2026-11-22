# Modo 2002 (`retro.css` + `retro.js` + `retro-fx.js`)

Easter egg con botón visible: el monitor que está al lado del sol/luna convierte todo el sitio en una página de principios de los 2000, con la estética de Windows 98. Es aparte del modo claro/oscuro y no lo toca.

## Cómo se activa

- **Botón del monitor** (`.retro-toggle`): en la barra de arriba de inicio, FAQ, blog y empresas; flotando arriba a la derecha en `gracias.html` y `404.html`; en el encabezado de `estado.html`.
- **Link directo:** `mariopc.com.ar/?retro=1` (sirve en cualquier página). `?retro=0` lo apaga. Sirve para mandarlo desde Instagram o WhatsApp.
- **Para salir:** el mismo botón, "Apagar el equipo..." en el menú Inicio, o escribir `SALIR` en la página de estado. Al apagar aparece la pantalla negra de "Ya podés apagar tu equipo con seguridad" y vuelve al 2026.
- La elección queda guardada en el navegador (`localStorage`, clave `mpc-retro`), como el modo claro.

## Cómo está armado

| Archivo | Qué tiene | ¿Se baja siempre? |
|---|---|---|
| Script chico del `<head>` | Lee `?retro=` y `mpc-retro` y pone `data-retro` en `<html>` antes de dibujar, para que no parpadee | Sí (va escrito en cada página) |
| `retro.css` | Toda la piel: colores, biseles, ventanas, barra de tareas, ventanita de chat, fotolog, DOS, 404. Todo cuelga de `html[data-retro]`, así que sin el modo no cambia nada | Sí (es chico y así no hay parpadeo) |
| `retro.js` | Solo el botón, la preferencia guardada y la carga de `retro-fx.js` | Sí |
| `retro-fx.js` | Todo lo que se arma con JavaScript (ver abajo) | **No**: se baja recién cuando alguien activa el modo |

`retro-fx.js` expone `window.MPCRetro` (`start`, `stop`, `connect`, `shutdown`) y `retro.js` expone `window.MPCRetroToggle` (`enable`, `disable`, `isOn`). Todo lo que agrega `start()` se deshace en `stop()`, así que apagar el modo deja la página exactamente como estaba, sin recargar.

## Qué hace el modo 2002

- **Piel Windows 98:** fondo de estrellas, ventanas grises con bisel, botones en relieve, Verdana/Tahoma/Arial Black/Courier, sin bordes redondeados ni transiciones, barras de desplazamiento grises. El sol/luna se oculta (en 2002 no había modo oscuro).
- **Cartel** "Esta página se ve mejor con Internet Explorer 6.0 a 800x600" arriba de todo.
- **Marquesina** verde sobre negro abajo del menú. En la home, las cintas onduladas se reemplazan por marquesinas con el mismo texto (lo toman de `data-marquee-text`).
- **Secciones como ventanas:** cada `main > section.band`, `.hero`, `.page-hero`, `.note-section` y el `footer` reciben una barra de título con el nombre de la sección y los botones `_ □ X`. Minimizar o cerrar la manda a la barra de tareas (de ahí se restaura). Maximizar la estira a todo el ancho.
- **Barra de tareas** abajo, con botón **Inicio** (menú con las páginas, WhatsApp, música y "Apagar el equipo..."), las ventanas minimizadas, el botón de música y un reloj con la hora real de Argentina. Al pasar el mouse por el reloj, la fecha es la de hoy pero en 2002 (con el día de la semana correcto de ese año).
- **WhatsApp como ventana de chat** estilo Messenger: "Mario PC (Conectado)" o "(Ausente)" según `horario.js`, con el mismo aviso de cuándo abro. Toda la ventanita es el link a WhatsApp. A los 20 segundos de visita, si estoy atendiendo, manda un **zumbido** (la ventana tiembla), una sola vez por visita. En el celular se ve compacta (solo la barra y el estado).
- **Pelusa** como el asistente del Office viejo: globitos amarillos y ventana de Windows.
- **Pantalla azul de Windows 98** en la tarjeta rota de precios ("Error 0x80070057"). La lógica está en `index.html` (`bsod.open98`); sin el modo sigue saliendo la pantalla azul moderna.
- **Pie** con contador de equipos reparados, botoncitos de 88x31 y "Última actualización" con la fecha del archivo pero en 2002.
- **Blog como fotolog:** fondo negro, foto grande con marco blanco, título amarillo y "Firmá mi fotolog" en cada nota, que abre WhatsApp con un mensaje sobre esa nota. En la nota completa, el recuadro final dice "Libro de firmas".
- **Estado del equipo como pantalla de DOS:** letras grises sobre negro, `C:\MARIOPC> ESTADO.EXE`, botones `[ VER CÓMO VA ]` y `SALIR` para volver. No hay barra de tareas ni ventanas en esa página.
- **404 clásico:** "No se puede mostrar la página" del navegador viejo, con links al inicio y a WhatsApp. Está escrito en `404.html` dentro de `.retro-only`.
- **Fotos que bajan como con módem de 56k** (de a franjas, de arriba hacia abajo), una vez por foto.
- **Estela de estrellitas** detrás del mouse (solo en compu).
- **Protector de pantalla:** después de 90 segundos sin mover el mouse ni tocar el teclado, el logo rebota por la pantalla (solo en compu). Cualquier movimiento lo saca.
- **Música** chiptune original, sintetizada en el navegador (no hay archivo). Nunca arranca sola: solo con el parlante de la barra de tareas o desde el menú Inicio. Se corta si cambiás de pestaña.
- **Sonido del módem** al activar el modo con el botón (tono, discado, respuesta y negociación, unos 4,5 segundos), también sintetizado, con la ventanita "Conectando a Mario PC" que va de "Marcando..." a "Conectado a 56.000 bps". Suena la primera vez por visita.

Si alguien tiene activado "reducir movimiento" en su sistema: no hay marquesina en movimiento, ni parpadeos, ni zumbido, ni estela, ni protector de pantalla, ni fotos por franjas, ni sonido del módem.

## Lo que se cambia seguido

Todo está en `CONFIG`, al principio de `retro-fx.js`:

- `reparados`: el número del contador del pie. **Es un dato real, actualizalo a mano** (con 0 se oculta).
- `zumbidoSeg` y `protectorSeg`: cuándo aparecen el zumbido y el protector.
- `volumenModem` y `volumenMusica`: arrancan bajitos y todavía no se midieron contra los otros sonidos. Si los cambiás, probalos al lado del flashbang y del miau de Pelusa para que suenen parecido.

Textos: la marquesina de arriba y el cartel están en `setupBanners`, los del chat en `setupChat`, el menú Inicio en `setupTaskbar`, la pantalla de DOS en `setupDos`, la pantalla azul en `index.html` (`open98`) y el 404 en `404.html`. Los textos del modo 2002 no nombran el barrio a propósito, para no tener que tocarlos si cambia la zona (las marquesinas de la home sí lo dicen porque copian las cintas).

## Reglas para cambios futuros

- **Componentes nuevos:** después de agregar una sección o un componente, mirá cómo queda con `?retro=1`. Si usa las variables (`var(--white)`, `var(--surface)`, `var(--ring)`, etc.), casi siempre queda bien solo. Si usa colores fijos o fondos oscuros, sumale su regla en `retro.css` bajo `html[data-retro]`.
- **Secciones nuevas en la home o subpáginas:** si es `main > section.band`, se convierte sola en ventana (toma el título del primer `h1` o `h2`).
- **Página nueva:** copiale lo mismo que tienen las demás:
  1. el script chico del `<head>` (va justo abajo del del modo claro),
  2. `<link rel="stylesheet" href="/retro.css?v=1">` después de `site.css`/`pelusa.css`,
  3. el botón `.retro-toggle` antes del sol/luna,
  4. `<script src="/retro.js?v=1" defer></script>` después de `theme.js`.
- **`estado.html` tiene CSP:** si cambiás el script chico del `<head>`, hay que recalcular su hash `sha256-…` en la CSP de esa página (igual que con el del modo claro). El hash actual del script del modo 2002 es `sha256-Vk7WY9QmH2gFazXqsUSsGHFyp9W8SVbh01Gk86bLWl8=`.
- **Versiones:** si cambiás `retro.css` o `retro.js`, subí el `?v=1` en las 7 páginas. Si cambiás `retro-fx.js`, subí `FX_SRC` dentro de `retro.js` (y entonces también el `?v=` de `retro.js`).
- **Nada de marcas ajenas:** el modo imita la época, no logos. No hay logos de Windows, MSN, Internet Explorer ni Fotolog; la barra de título de la pantalla azul dice "MarioPC".
- **El WhatsApp nunca se esconde:** la ventanita de chat es el mismo link del botón flotante. Si se rediseña, que siga siendo fácil de ver y de tocar.
- **Medición:** activar o desactivar manda el evento `retro_toggle` a Google Analytics (`retro: on/off`), igual que `theme_toggle`. La página de estado no tiene Analytics.

## Cómo probarlo en la compu

Desde la carpeta del repo: `python3 -m http.server 8000` y abrí `http://localhost:8000/?retro=1`. Probá también `/faq.html`, `/blog.html`, `/estado.html`, `/gracias.html` y una dirección que no exista (por ejemplo `/nada.html` no muestra el 404 en el servidor local de Python; abrí `/404.html` directo).

## Ideas pendientes

- **WebRing con comercios de la zona:** botoncitos "‹ Anterior · Al azar · Siguiente ›" en el pie, linkeando a dos o tres comercios amigos (promoción cruzada). Quedó para más adelante a pedido de Mario; consultarle antes de armarlo.
