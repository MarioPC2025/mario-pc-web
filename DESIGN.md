# Sistema visual de Mario PC

Lo usan la web (este repo) y la app del taller (`mario-pc-app`). Este archivo describe lo que ya existe, para que los cambios futuros sigan el mismo sistema. Los valores en código están en `site.css` (tema oscuro), `theme.css` (tema claro) y, en la app, en `web/app.css`.

## Identidad

- Servicio técnico de un solo técnico, en Olivos. La web es Mario hablando con un vecino, no una empresa.
- Directo y práctico: precio claro, WhatsApp a mano, sin vueltas.
- Con humor: los easter eggs (tarjeta rota, rickroll, consola, bug que se asoma, escáner, flashbang del modo claro) son parte de la marca. Nunca tapan una acción real.

## Colores

| Token | Oscuro (por defecto) | Claro | Uso |
|---|---|---|---|
| `--bg` | `#07090a` | `#f4f6f5` | Fondo |
| `--bg-alt` | `#0c0f10` | `#e9eeeb` | Bandas alternadas |
| `--surface` | `#101415` | `#ffffff` | Tarjetas y formularios |
| `--white` | `#e8edea` | `#0d1210` | Texto principal |
| `--muted` | `#788480` | `#4f5a56` | Texto secundario |
| `--green` | `#1ddd65` | `#087035` | Acento: títulos destacados, precios, foco |
| `--green-fill` | `#1ddd65` | `#1ddd65` | Botón principal, con texto `#030804` |
| `--red` | `#ff9a9a` | `#b42318` | Solo para "cerrado" y la tarjeta rota |

- Un solo acento: el verde. Va en la palabra destacada del título, los precios, el botón de WhatsApp y el foco.
- Todos los pares de texto pasan WCAG AA en los dos temas (el gris más justo es 4.78:1).

## Tipografía

- **Bebas Neue**, en mayúsculas: títulos (`.display`) y precios. Es la voz fuerte de la marca.
- **DM Sans**: texto corrido, botones y etiquetas de formulario. Los botones van en minúscula normal, peso 600.
- **Space Mono**: solo para datos (horarios, "Desde", fechas, minutos de lectura) y para la estética de consola de los easter eggs.
- Los títulos nunca van en cursiva. El énfasis se marca en verde (`.green` o `<em>` sin cursiva).

## Composición

- Ancho máximo de 1180 px, márgenes laterales de 20 px y bandas de 96 px (72 px en el celular).
- Bordes de 3 px en botones y de 6 px en tarjetas. Nada en forma de píldora, salvo los botones redondos flotantes.
- Las sombras se reemplazan por un anillo de 1 px (`--ring`). La única sombra con brillo es la del WhatsApp flotante.
- El grano (`.grain`) es la única textura. No se usan grillas de puntos ni fondos con líneas.
- La cinta ondulada verde con texto que corre es el motivo de la home: separa las secciones.

## Movimiento

- Hover y presión (`scale: 0.96`) en botones, más el texto de la cinta.
- Nada late para siempre: el pin del mapa hace 3 pulsos al aparecer.
- Todo respeta `prefers-reduced-motion`.

## Voz

- Primera persona, español rioplatense: "Arreglo tu compu", "Te paso el precio", "Escribime".
- Las preguntas se escriben como las haría un cliente: "¿Me retirás el equipo?", y no "¿Hacen retiro?".
- Sin guiones largos (—). En su lugar van punto, coma, dos puntos o "·" en los títulos.
- Solo datos reales: los precios, las reseñas y los números de la home los confirma Mario.
