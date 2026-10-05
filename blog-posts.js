/* ═══════════════════════════════════════════════════════════════
   blog-posts.js — Acá se cargan las notas del blog.
   Lo usan la home (últimas 3 notas) y blog.html (listado y nota completa).
   Instrucciones paso a paso: README.md → "Publicar una nota de blog".
   ═══════════════════════════════════════════════════════════════ */

// Autor que aparece en cada nota (foto chica + nombre). La foto va en /blog.
// Si el archivo no existe, se muestra un círculo con la inicial.
const AUTHOR = {
    name: "Mario",
    role: "Técnico · Mario PC, Olivos",
    photo: "blog/mario.jpg"
};

// Una nota por bloque { ... }, separadas por coma. La más nueva se muestra primero.
const blogPosts = [
    // {
    //     slug: "como-saber-si-tu-pc-necesita-un-ssd",
    //     title: "Cómo saber si tu PC necesita un SSD",
    //     date: "2026-10-10",
    //     image: "blog/ssd-post.jpg",
    //     imageAlt: "Disco SSD al lado de un disco rígido",
    //     excerpt: "Resumen corto que se ve en la tarjeta (1 o 2 frases).",
    //     content: `El texto completo de la nota.
    //
    // Una línea en blanco separa los párrafos.
    //
    // ## Un subtítulo
    //
    // - Un punto de lista
    // - Otro punto de lista
    //
    // Podés usar **negrita** y [un link](https://www.mariopc.com.ar).`
    // },

    // ─── NOTA 1 ───
    {
        slug: "por-que-mi-compu-anda-lenta",
        title: "Mi compu anda lenta: qué le pasa (aunque antes andaba re bien)",
        date: "2026-10-05",
        image: "blog/pc-lenta.jpg",
        imageAlt: "Ilustración de una notebook con una barra de carga casi vacía y un velocímetro con la aguja en la zona baja",
        excerpt: "Si tu compu volaba cuando la compraste y hoy se arrastra, casi nunca es “que se hizo vieja” sin más. Estas son las 6 causas más comunes y cómo reconocerlas.",
        content: `Te pasa seguido: comprás la compu, anda de maravilla, y unos años después tarda una eternidad en prender, se cuelga al abrir el navegador y hasta el mouse parece ir con retraso. Es una de las consultas que más recibo, y la buena noticia es que **en la mayoría de los casos tiene arreglo**, sin necesidad de cambiar la compu entera.

Una compu lenta es como un auto que hace años no pasa por el mecánico: no está "rota", pero hay varias cosas que se fueron gastando o acumulando. Estas son las causas más comunes.

## 1. El disco es viejo (la causa más frecuente)

Muchas compus de hace unos años vienen con un disco rígido tradicional (HDD), que tiene partes mecánicas y es mucho más lento que los discos modernos (SSD). Con el tiempo, Windows, los programas y las actualizaciones se vuelven más pesados y ese disco no da abasto.

Cambiarlo por un SSD es, por lejos, la mejora que más se nota: la compu suele arrancar en segundos y los programas abren casi al instante. Y no perdés nada: puedo pasar tu Windows y tus archivos al disco nuevo.

## 2. Se quedó corta de memoria RAM

La RAM es el "escritorio" donde la compu trabaja con lo que tenés abierto. Si es poca, cada pestaña del navegador o cada programa extra la ahoga. Hoy, con 4 GB se pasa trabajo; 8 GB es lo cómodo para el uso de todos los días.

## 3. Hay demasiadas cosas arrancando solas

Con los años se van instalando programas que, sin que te des cuenta, se abren cada vez que prendés la compu. Todos compiten por los mismos recursos y el arranque se vuelve eterno.

## 4. Programas basura o virus

Barras raras en el navegador, publicidad que aparece sola, "optimizadores" que prometen acelerar todo... muchos de esos programas son justamente lo que la frena. Los virus también consumen recursos en silencio.

## 5. Calor: el polvo la está frenando

Cuando el polvo tapa el ventilador y la pasta térmica se seca, la compu se calienta. Para no dañarse, se frena sola. Si además el ventilador suena fuerte o la base quema, [leé esta nota sobre compus que se calientan](blog.html?nota=mi-compu-se-calienta-mucho).

## 6. El disco está casi lleno o empieza a fallar

Un disco lleno trabaja con dificultad. Y si además escuchás clics o ruidos raros, se cuelga seguido o hay archivos que no abren, puede estar fallando. En ese caso **hacé una copia de tus archivos importantes cuanto antes** y no la fuerces.

## Un chequeo rápido que podés hacer vos

- Apretá **Ctrl + Shift + Esc** a la vez: se abre el Administrador de tareas.
- Mirá la columna **Disco**. Si está clavada en 100% aunque no estés haciendo nada, el disco es el principal sospechoso.
- Abrí "Este equipo" (o "Esta PC") y fijate cuánto espacio libre le queda al disco C:. Si está casi lleno, es otro motivo.

## ¿Y ahora qué?

No hace falta que adivines cuál de todas es la tuya, y menos que empieces a desinstalar cosas a ciegas: a veces se empeora. Contame qué compu tenés, desde cuándo anda así y qué es lo que más notás. **Reviso tu equipo sin cargo, te digo qué le pasa y te paso el costo exacto antes de tocar nada.** Todo lo que reparo tiene 7 días de garantía.

Estoy en Olivos y atiendo toda la zona norte, en el taller o coordinando el retiro.

[Escribime por WhatsApp y le damos velocidad a tu compu](https://wa.me/5491123999259?text=Hola%20Mario%2C%20mi%20compu%20anda%20muy%20lenta%20y%20quiero%20que%20la%20revises)`
    },

    // ─── NOTA 2 ───
    {
        slug: "como-saber-si-mi-compu-necesita-mantenimiento",
        title: "¿Cómo sé si mi compu necesita mantenimiento? 7 señales que no conviene ignorar",
        date: "2026-10-05",
        image: "blog/mantenimiento-pc.jpg",
        imageAlt: "Ilustración de un ventilador de computadora con polvo, junto a una llave y un destornillador cruzados, un engranaje y una tilde verde",
        excerpt: "Tu compu avisa antes de fallar, y no hace falta ser técnico para darte cuenta. Estas son las señales de que llegó la hora de un service, y cada cuánto conviene hacerlo.",
        content: `Tu compu casi nunca se rompe de un día para el otro. Antes de fallar, **avisa**: se vuelve más lenta, hace ruidos, se calienta... El problema es que esas señales aparecen de a poco, y uno se acostumbra sin darse cuenta.

Esta lista te sirve para detectarlas a tiempo. Si te identificás con **dos o más**, probablemente ya sea momento de un mantenimiento.

## Las 7 señales

- **Tarda mucho en prender** y en abrir los programas, bastante más que cuando la compraste.
- **El ventilador suena fuerte** casi todo el tiempo, como si estuviera haciendo un esfuerzo enorme (a veces parece un avión).
- **Se calienta mucho**: la base de la notebook quema o sale aire muy caliente por los costados o por atrás.
- **Se cuelga o se reinicia sola**, o aparece la famosa pantalla azul.
- **Se apaga de golpe**, sobre todo cuando le exigís: varios programas abiertos, videollamadas, juegos.
- **Hace ruidos raros**: clics, chasquidos o zumbidos que antes no estaban.
- **Tiene años y nunca la abriste**: aunque no tenga síntomas, el polvo se acumula por dentro igual.

## Una señal que sí es urgente

Si tu notebook tiene la **batería hinchada** (la base se abomba, el touchpad se levanta o la tapa no cierra bien), dejá de usarla y de cargarla, y escribime. Una batería en ese estado puede ser peligrosa y no es algo para dejar pasar.

## ¿Cada cuánto hay que hacer mantenimiento?

Como regla general, una limpieza interna cada **1 o 2 años**. Conviene hacerla más seguido si tenés mascotas, si hay mucho polvo en casa o si la usás muchas horas por día. Una compu que trabaja todo el día suele necesitarla antes que una que se usa de vez en cuando.

## Qué incluye un mantenimiento

Según lo que necesite tu equipo, puede incluir:

- Limpieza interna del polvo: ventiladores, disipador y rejillas.
- Cambio de la pasta térmica cuando está reseca (es la que ayuda a que el procesador pase bien el calor).
- Revisión del estado del disco, para detectar problemas antes de que se pierdan archivos.
- Puesta a punto de Windows: programas que arrancan solos, actualizaciones y revisión de virus.

## Dos hábitos que le alargan la vida

- No uses la notebook sobre la cama, el sillón o una almohada: tapan las ventilas y la hacen calentar.
- Guardá una copia de tus fotos y documentos importantes en un disco externo o en la nube. Si algo falla, no perdés nada.

## ¿Y si no estás seguro?

Es completamente normal. Escribime contándome qué compu tenés, qué síntomas notás y hace cuánto no le hacés un service. **Reviso tu equipo sin cargo, te digo qué necesita y te paso el costo exacto antes de tocar nada**, con 7 días de garantía sobre el trabajo.

Estoy en Olivos y atiendo la zona norte, en el taller o coordinando el retiro. Si te sirvió esta nota, también podés leer por qué una compu [se pone lenta con los años](blog.html?nota=por-que-mi-compu-anda-lenta).

[Escribime por WhatsApp y vemos si le toca un service](https://wa.me/5491123999259?text=Hola%20Mario%2C%20quiero%20saber%20si%20mi%20compu%20necesita%20mantenimiento)`
    },

    // ─── NOTA 3 ───
    {
        slug: "mi-compu-se-calienta-mucho",
        title: "Mi compu se calienta mucho: por qué pasa y qué hacer antes de que se dañe",
        date: "2026-10-05",
        image: "blog/pc-caliente.jpg",
        imageAlt: "Ilustración de una notebook con ondas de calor que suben y un termómetro con la temperatura alta",
        excerpt: "Si tu notebook quema, el ventilador suena como un avión o se apaga sola, no es normal. Las causas más comunes, qué podés hacer ahora y cuándo conviene revisarla.",
        content: `Que una compu entre en calor es normal. Que **queme**, que el ventilador suene como una turbina o que se apague sola, no. Y con el verano a la vuelta de la esquina, el problema se nota todavía más.

Lo que pasa es esto: toda compu tiene un sistema de refrigeración (un ventilador y un disipador) que saca el calor de adentro. Cuando ese sistema falla, la compu, para protegerse, **se frena sola o se apaga**. Por eso el calor y la lentitud suelen ir de la mano: si tu compu también [anda lenta](blog.html?nota=por-que-mi-compu-anda-lenta), puede ser la misma causa.

## ¿Es normal o es un problema?

- **Normal:** está tibia, y el ventilador sube un poco cuando le exigís (una videollamada, un juego) y baja después.
- **Problema:** la base no se puede tocar, el ventilador va a full aunque no estés haciendo nada, se apaga sola o sentís olor a quemado.

## Las causas más comunes

- **Polvo.** Con los meses se forma una especie de felpa que tapa el ventilador y las rejillas. Es como intentar correr con una bufanda tapándote la boca.
- **Pasta térmica reseca.** Es la pasta que ayuda a que el procesador le pase el calor al disipador. Con los años se seca y deja de cumplir su función.
- **Mal lugar de uso.** Sobre la cama, el sillón o una almohada, las ventilas quedan tapadas. En las compus de escritorio, un gabinete pegado a la pared o metido en un mueble tiene el mismo efecto.
- **Ventilador gastado o trabado.** Con el uso pierde fuerza, hace ruido o directamente deja de girar.
- **Programas que la hacen trabajar de más.** Virus, o demasiadas cosas abiertas a la vez, la obligan a esforzarse al máximo todo el tiempo.
- **Ambiente caluroso.** En verano, una compu con el sistema de refrigeración ya cansado es la primera en sufrir.

## Qué podés hacer ahora mismo

- Apoyala sobre una superficie dura y plana, como una mesa. Si podés, levantá un poquito la parte de atrás para que entre aire.
- Cerrá los programas y las pestañas que no estés usando.
- Revisá que las rejillas no estén tapadas por cables, ropa o la pared. En una compu de escritorio, dejá espacio libre atrás y a los costados.
- Una base con ventiladores puede dar una mano, pero no resuelve el problema de fondo si hay polvo adentro.
- Evitá meterle la aspiradora o abrirla si no tenés experiencia: se pueden dañar componentes.

## Cuándo es urgente

Apagala, dejala enfriar y no la uses hasta que la revisen si:

- Sentís olor a quemado o a plástico.
- Se apaga sola seguido.
- La base está demasiado caliente para apoyar la mano.
- El ventilador hace ruidos raros o directamente no gira.

El calor sostenido acorta la vida útil de los componentes, y reparar a tiempo suele salir mucho menos que esperar a que algo se dañe.

## Qué se hace para arreglarlo

Lo habitual es limpiar por dentro el ventilador y el disipador, renovar la pasta térmica si está reseca y comprobar que todo gire y refrigere como corresponde. En muchos casos, la compu vuelve a andar fresca y silenciosa.

## ¿Querés que la revise?

Escribime contándome qué compu tenés y qué notás: si quema, si el ventilador suena fuerte, si se apaga sola. **Reviso tu equipo sin cargo, te digo qué le pasa y te paso el costo exacto antes de tocar nada**, y el trabajo tiene 7 días de garantía.

Estoy en Olivos y atiendo toda la zona norte, en el taller o coordinando el retiro. Si además querés saber [cómo darte cuenta de que necesita un service](blog.html?nota=como-saber-si-mi-compu-necesita-mantenimiento), tenés una lista con las señales.

[Escribime por WhatsApp y la revisamos antes de que se dañe](https://wa.me/5491123999259?text=Hola%20Mario%2C%20mi%20compu%20se%20calienta%20mucho%20y%20quiero%20que%20la%20revises)`
    },

    // ─── NOTA 4 ───
    {
        slug: "windows-10-fin-de-soporte-que-hacer",
        title: "Windows 10 ya no tiene soporte: qué significa para tu compu y qué conviene hacer",
        date: "2026-10-05",
        updated: "2026-10-05",
        image: "blog/windows-10.jpg",
        imageAlt: "Ilustración de dos ventanas unidas por una flecha: una con el número 10 y una alerta de seguridad, y otra con el 11 y un escudo con tilde",
        excerpt: "Windows 10 ya no recibe actualizaciones gratuitas de seguridad. No se apaga solo, pero conviene decidir qué hacer. Cómo saber qué tenés y cuáles son tus opciones.",
        content: `Si tu compu tiene Windows 10, seguramente viste avisos que dicen que llegó al final de su soporte. Y si no los viste, esta nota te interesa igual. Te cuento **qué significa en la práctica, si tenés que preocuparte y qué opciones tenés**, sin vueltas técnicas.

## Qué pasó con Windows 10

El 14 de octubre de 2025, Microsoft dejó de dar soporte a Windows 10. Eso significa que ya no manda mejoras ni **actualizaciones de seguridad gratuitas** para ese sistema.

Tu compu no se apaga ni deja de funcionar de golpe: sigue andando igual que ayer. El tema es otro. Cada vez que se descubre una falla de seguridad nueva, los equipos sin actualizar quedan expuestos. Es como una casa a la que dejan de arreglarle las cerraduras mientras los ladrones aprenden trucos nuevos.

## ¿Tengo Windows 10? Cómo saberlo en 10 segundos

- Apretá la tecla **Windows** y la letra **R** a la vez.
- Escribí **winver** y apretá Enter.
- Se abre una ventanita que dice qué versión tenés. Si dice **Windows 10**, esta nota es para vos. Si dice **Windows 11**, quedate tranquilo: no te afecta.

## Tus opciones

### Opción 1: pasar a Windows 11 (la mejor, si tu compu puede)

Si tu equipo cumple los requisitos, la actualización a Windows 11 es gratuita y te deja con un sistema que sigue recibiendo mejoras y actualizaciones de seguridad.

Para saber si podés, entrá en **Configuración → Actualización y seguridad → Windows Update**: Windows te avisa si tu equipo es compatible o no. Como regla general, muchas compus anteriores a 2018 más o menos no cumplen los requisitos, sobre todo por el procesador y por un chip de seguridad que les falta.

Dos cosas para tener en cuenta:

- Antes de actualizar, **hacé una copia de tus archivos importantes**.
- Windows 11 en un disco rígido viejo suele andar pesado. Si tu compu ya [anda lenta](blog.html?nota=por-que-mi-compu-anda-lenta), conviene pensar en un SSD y en 8 GB de RAM al mismo tiempo.

### Opción 2: seguir con Windows 10, pero protegida

Microsoft ofrece un programa de **actualizaciones de seguridad extendidas** (ESU) para Windows 10. Cubre solamente actualizaciones de seguridad: no trae mejoras ni soporte técnico.

Según Microsoft, podés inscribirte hasta el **12 de octubre de 2027**, y esa es también la fecha hasta la que dura la cobertura. Hay tres formas de inscribirse: sin costo si activás la copia de seguridad de tu configuración con una cuenta Microsoft, canjeando puntos de Microsoft Rewards, o con un pago único (US$30 en Estados Unidos). Las opciones y los precios pueden variar según el país.

Para inscribirte, tu compu necesita tener Windows 10 versión 22H2, estar actualizada y usar una cuenta Microsoft como administrador.

Pensalo como un puente y no como un destino: te da tiempo para decidir, y anotarte no te impide pasar a Windows 11 más adelante. (Este dato está verificado a octubre de 2026; Microsoft puede cambiar estas condiciones.)

### Opción 3: cambiar de equipo

Si la compu es muy vieja, anda lenta y no es compatible con Windows 11, a veces lo más sensato es cambiarla. Y te lo digo con honestidad: si no vale la pena arreglarla, te lo voy a decir.

## Lo que no conviene hacer

- **Ignorar el tema** esperando que no pase nada. Sin parches de seguridad, el riesgo crece mes a mes.
- **Descargar "activadores" o programas raros** que prometen arreglar Windows 10: es una de las formas más comunes de meterse un virus.
- **Actualizar sin hacer antes una copia** de tus fotos y documentos.

## ¿Y ahora qué?

Si no sabés qué versión tenés, si tu compu puede pasar a Windows 11 o qué te conviene en tu caso, escribime. **Reviso tu equipo sin cargo, te digo si es compatible, qué necesitaría (por ejemplo un SSD o más RAM) y cuánto sale, antes de tocar nada.** El trabajo tiene 7 días de garantía.

Estoy en Olivos y atiendo toda la zona norte, en el taller o coordinando el retiro.

[Escribime por WhatsApp y vemos qué le conviene a tu compu](https://wa.me/5491123999259?text=Hola%20Mario%2C%20tengo%20Windows%2010%20y%20quiero%20saber%20que%20conviene%20hacer%20con%20mi%20compu)`
    },

    // ─── NOTA 5 ───
    {
        slug: "como-hacer-copia-de-seguridad-de-tus-archivos",
        title: "Cómo hacer una copia de seguridad de tus archivos (sin ser técnico) antes de que sea tarde",
        date: "2026-10-05",
        image: "blog/copia-seguridad.jpg",
        imageAlt: "Ilustración de una notebook que envía sus archivos a una nube y a un disco externo, con un escudo con tilde",
        excerpt: "Fotos, documentos, chats de WhatsApp: si tu compu falla, ¿qué perdés? La regla 3-2-1 explicada en simple y cómo hacer tu primera copia hoy mismo.",
        content: `Pensá en todo lo que tenés guardado en tu compu: fotos de la familia, documentos, trámites escaneados, archivos del trabajo o del estudio. Ahora una pregunta incómoda: **si mañana no prende, ¿tenés una copia de todo eso en otro lado?**

Lo más común es acordarse de hacer la copia recién cuando ya es tarde. La buena noticia es que no hace falta ser técnico: con una tarde y un par de cosas simples, lo importante queda a salvo.

## ¿De qué te protege una copia de seguridad?

- **De un disco que falla.** Los discos se gastan y no siempre avisan antes de dejar de andar.
- **De virus que "secuestran" tus archivos**, los bloquean y te piden plata para devolverlos.
- **De un robo, una pérdida o un golpe** a la notebook.
- **De errores y accidentes:** un archivo borrado sin querer, un café derramado sobre el teclado.
- **De una reinstalación de Windows**, que a veces implica borrar todo el disco.

## La regla 3-2-1, en simple

Es la regla que usan los técnicos, y es más fácil de lo que suena:

- **3 copias** de lo importante: el original en tu compu, más dos copias.
- **2 lugares distintos**: por ejemplo, tu compu y un disco externo.
- **1 copia fuera de tu casa**: en la nube, por si hay un robo o un incendio.

No hace falta que sea perfecto desde el primer día: tener **dos copias ya es muchísimo mejor que tener una sola**.

## Qué conviene copiar

- **Fotos y videos.** Revisá también las del celular.
- **Documentos.** Mirá las carpetas Documentos, Escritorio y Descargas: mucha gente guarda cosas importantes ahí sin darse cuenta.
- **Archivos de trabajo o estudio, planillas, facturas y trámites escaneados.**
- **Tus contraseñas.** Si las guardás en el navegador, activá la sincronización con tu cuenta para no perderlas.
- **Los chats de WhatsApp.** En la app, entrá en Ajustes → Chats → Copia de seguridad y activala.

## Tres formas de hacerla, de la más simple a la más completa

### Opción 1: un disco externo

Conseguí un disco externo con más espacio del que ocupan tus archivos. Conectalo, abrí "Este equipo" y copiá tus carpetas arrastrándolas. Cuando termine, **abrí un par de archivos de la copia para comprobar que se vean bien**. Después desconectalo y guardalo en un cajón.

Un pendrive sirve para pocos archivos, pero no es buena idea que sea tu única copia: se pierden y se rompen con facilidad.

### Opción 2: la nube

Servicios como OneDrive, Google Drive o iCloud guardan tus archivos en internet. Se actualizan solos y te protegen si le pasa algo a tu casa o a tu compu. Los planes gratuitos tienen poco espacio (unos pocos GB, según el servicio) y, si necesitás más, se paga. En Windows, OneDrive puede copiar automáticamente tus carpetas Escritorio, Documentos e Imágenes.

### Opción 3: las dos juntas (la mejor)

Disco externo y nube a la vez: con eso ya cumplís la regla 3-2-1.

## Los errores más comunes

- **Guardar la "copia" en la misma compu**, en otra carpeta o en la unidad D:. Casi siempre es el mismo disco, y si falla se pierden las dos.
- **Dejar el disco externo siempre enchufado.** Un virus también podría afectarlo. Conectalo para copiar y desconectalo después.
- **Hacer la copia una sola vez** y nunca más. Poné un recordatorio, por ejemplo una vez al mes.
- **No comprobar que la copia funciona.** Una copia que nunca abriste es una copia de la que no podés estar seguro.

## Cuándo hacerla ya mismo

- Si la compu hace ruidos raros, se cuelga seguido o [anda lenta](blog.html?nota=por-que-mi-compu-anda-lenta). Mirá [las señales de que necesita mantenimiento](blog.html?nota=como-saber-si-mi-compu-necesita-mantenimiento).
- Antes de [pasar de Windows 10 a Windows 11](blog.html?nota=windows-10-fin-de-soporte-que-hacer).
- Antes de llevarla a reparar o de formatearla.

Y si el disco ya hace clics o ruidos raros, o tus archivos no abren: **apagala y no insistas**. Cada vez que se enciende puede empeorar. Escribime antes de hacer nada más; no te puedo asegurar que se pueda recuperar todo, pero cuanto antes se revise, más chances hay.

## ¿Y si no sabés por dónde empezar?

Contame qué compu tenés y cómo la usás (cuántas fotos y archivos aproximadamente, si ya usás alguna nube) y te armo un plan de copias simple, a tu medida. Si tu equipo ya da señales de falla, **lo reviso sin cargo y te paso el costo exacto antes de tocar nada**, con 7 días de garantía sobre el trabajo.

Estoy en Olivos y atiendo toda la zona norte, en el taller o coordinando el retiro.

[Escribime por WhatsApp y armamos tu plan de copias](https://wa.me/5491123999259?text=Hola%20Mario%2C%20quiero%20armar%20una%20copia%20de%20seguridad%20de%20mis%20archivos%20y%20no%20se%20por%20donde%20empezar)`
    },
];
