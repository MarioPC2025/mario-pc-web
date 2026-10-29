# Publicación automática de Instagram · Mario PC

GitHub publica solo en @mariopc.com.ar los posts aprobados, a la fecha y hora de cada uno, sin
ninguna compu encendida. Esta carpeta no se ve en la web (las carpetas que empiezan con punto no
se publican).

## Cómo funciona

1. Claude arma las piezas (imágenes en `instagram/cola/`) y las agrega a `cola.json` en un
   **Pull Request**.
2. Mario revisa el PR (imágenes y epígrafes) desde la compu o la app de GitHub. Si algo no le
   gusta, lo comenta y Claude lo corrige.
3. **Unir el PR = aprobar.** Desde ese momento, esas publicaciones quedan en la cola.
4. Cada 15 minutos, el workflow "Instagram · publicar" revisa la cola y publica lo que ya tiene
   fecha. Después marca la publicación como "publicado", guarda el link y la suma arriba de todo
   en el carrusel de Instagram de la home.
5. Si algo falla, se abre un aviso (issue) con la etiqueta `instagram` y GitHub te manda un mail.

## Cosas que se pueden hacer a mano, desde la web de GitHub

- **Pausar todo:** en `cola.json`, cambiar `"pausado": false` por `"pausado": true` y guardar
  (Commit changes). Para reanudar, volver a `false`.
- **Cambiar la fecha u hora de un post:** editar su `"fecha"` (formato `AAAA-MM-DD HH:MM`, hora de
  Buenos Aires).
- **Sacar un post de la cola:** cambiar su `"estado"` de `"pendiente"` a `"cancelado"`.
- **Corregir un epígrafe:** editar su `"epigrafe"` (los saltos de línea se escriben `\n`).
- **Probar sin publicar (y comprobar la clave):** pestaña Actions → "Instagram · publicar" → Run
  workflow, con la casilla "Solo mostrar qué publicaría" marcada. Si la clave está bien, el paso
  "Publicar lo que toca" dice "Clave OK: conectada a @mariopc.com.ar".
- **Publicar ya lo que esté vencido:** lo mismo, con la casilla desmarcada.

## Estados de cada publicación

| estado | qué significa |
| --- | --- |
| `pendiente` | aprobada, esperando su fecha |
| `publicado` | salió: tiene `link` y `publicado_el` |
| `atrasado` | pasaron más de 48 horas de su fecha sin publicarse (por ejemplo, la cola estaba en pausa). No sale sola: poné una fecha nueva y volvé el estado a `pendiente` |
| `error` | falló 3 veces seguidas. Mirá el campo `error` y el aviso abierto; corregido el problema, volvé el estado a `pendiente` |
| `cancelado` | no se publica |

## Secrets que usa (Settings → Secrets and variables → Actions)

| secret | qué es |
| --- | --- |
| `IG_TOKEN` | la clave de la página de Facebook de Mario PC (vinculada a @mariopc.com.ar), sacada del Explorador de la API Graph de Meta con la app "Mario PC publicador". No vence |
| `GH_PAT` | opcional: un token de GitHub con permiso de escritura sobre este repo, para que la web se actualice sola después de cada publicación |

La conexión es por el inicio de sesión con Facebook: `ig_user_id` en `cola.json` es el id de la
cuenta profesional de Instagram y las llamadas van a `graph.facebook.com`. La clave de la página no
vence, pero deja de servir si cambiás la contraseña de Facebook, si se quita la app o si perdés el
rol en la página. En ese caso, publicar falla, llega el aviso y hay que generar una clave nueva
(mismo procedimiento) y pegarla en `IG_TOKEN`.

## Renovar el acceso (cada 3 meses, 2 minutos)

La clave de la página no vence, pero Meta corta el acceso de la app a los datos si pasan 90 días
sin que vuelvas a autorizarla. La fecha está en `cola.json` (`renovar_acceso_antes`) y dos semanas
antes se abre un aviso solo. Para renovarlo:

1. Entrá a developers.facebook.com/tools/explorer, con la app "Mario PC publicador" elegida.
2. Tocá "Generate Access Token" y aceptá (marcando la página Mariopc.com.ar y @mariopc.com.ar).
3. En `cola.json`, cambiá `renovar_acceso_antes` a 90 días después de hoy.

La clave de `IG_TOKEN` sigue siendo la misma. Si Instagram rechaza la clave igual (llega un aviso
de error con "renovala desde el Explorador"), hay que sacar una nueva clave de página (el mismo
procedimiento de la primera vez) y reemplazarla en `IG_TOKEN`.

## Detalles técnicos

- API de Instagram con inicio de sesión con Facebook (`graph.facebook.com`, versión en
  `IG_API_VERSION`, por defecto v26.0). Solo JPG; las imágenes se bajan desde
  `https://www.mariopc.com.ar/instagram/cola/...`, así que tienen que estar publicadas en la web
  antes de la hora del post (lo están desde que se une el PR).
- Los horarios programados de GitHub pueden atrasarse unos minutos en momentos de mucha carga.
- GitHub apaga los workflows programados de un repo público después de 60 días sin actividad en el
  repo. Cada publicación genera un commit, así que mientras haya posts en la cola no pasa.
- Límite de Instagram: 100 publicaciones por día por API. Acá se usan 2 por semana.
