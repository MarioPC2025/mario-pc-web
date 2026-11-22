# CLAUDE.md

Guía para Claude Code en este repo. Mario hace casi todos los cambios de la web con Claude Code: leé esto antes de tocar nada.

## Qué es

El sitio de Mario PC (mariopc.com.ar): HTML/CSS/JS estático, **sin build tools**, hosteado en GitHub Pages desde `main`. Mario a veces edita directo desde la web de GitHub, así que todo tiene que seguir siendo editable a mano.

## Leer primero

- `README.md`: cómo está armado y cómo se hace cada cambio común (precios, notas del blog, horarios, Instagram, Pelusa, modo claro, estado).
- `DESIGN.md`: sistema visual y voz.
- `RETRO.md`: el **modo 2002** (botón del monitor, `?retro=1`). Cualquier cambio visual tiene que revisarse también en ese modo.

## Reglas que más se olvidan

- **Probá todo en los tres modos:** oscuro (por defecto), claro (sol/luna) y 2002 (`?retro=1`). Para probar local: `python3 -m http.server 8000` en la raíz del repo.
- **Colores con variables** (`var(--white)`, `var(--surface)`, `var(--ring)`, `rgba(var(--ink-rgb), …)`), nunca fijos: así funcionan en los tres modos. Si algo nuevo no queda bien en el modo 2002, sumale su regla en `retro.css` bajo `html[data-retro]`.
- **Caché:** si cambiás un `.css` o `.js` compartido, subí su `?v=` en todas las páginas que lo cargan (index, faq, empresas, blog, estado, gracias, 404). `retro-fx.js` se versiona desde `FX_SRC` en `retro.js`.
- **Menú y pie** están repetidos en index, faq, empresas y blog: cambialos en las cuatro.
- **`estado.html` tiene CSP con hashes** de sus scripts chicos del `<head>` (modo claro y modo 2002). Si cambiás uno, recalculá su `sha256-…`; si no, el navegador lo bloquea.
- **Página nueva:** copiale los cuatro pasos del modo 2002 (ver `RETRO.md`) además del modo claro.
- **Voz:** primera persona, español rioplatense, sin guiones largos (—). Solo datos reales: precios, reseñas y números los confirma Mario (incluye el contador `reparados` de `retro-fx.js`).
- **Easter eggs:** son parte de la marca, pero nunca tapan una acción real. El WhatsApp siempre tiene que quedar a mano.
- **Accesibilidad:** botones reales con `aria-label`, foco visible, `prefers-reduced-motion` respetado en todo lo que se mueve o suena.

## Historial de cambios grandes

- **Noviembre 2026, modo 2002** (rama `modo-2002`): botón del monitor en las 7 páginas, `retro.css`, `retro.js`, `retro-fx.js`, 404 clásico en `404.html`, pantalla azul de Windows 98 en la tarjeta rota (`bsod.open98` en `index.html`) y hash nuevo en la CSP de `estado.html`. Pendiente: WebRing con comercios de la zona (ver "Ideas pendientes" en `RETRO.md`; consultar a Mario antes).
