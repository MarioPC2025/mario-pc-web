// Pelusa: el asistente de Mario PC (el gato de Mario). Lo usan index, faq, blog y empresas.
// No es una IA: responde solo lo que está escrito en RESPUESTAS, con una pausa a propósito
// para que parezca que lo piensa. Para cambiar una respuesta, editá RESPUESTAS más abajo.
// Los precios están copiados de la sección "Servicios y precios" de index.html: si cambian allá, cambialos acá.
(function () {
    'use strict';

    // Imágenes y sonidos (ver README, sección "Pelusa")
    const IMG = {
        normal: '/img/pelusa.webp',
        pensando: '/img/pelusa-pensando.webp',
        durmiendo: '/img/pelusa-durmiendo.webp'
    };
    // Miaus reales de Pelusa. Si se ponen varios, se alternan. Si la lista queda vacía, suena un miau sintetizado.
    const SONIDOS = ['/pelusa-miau.mp3?v=2'];
    const VOLUME = 0.25;

    const WA = 'https://wa.me/5491123999259';
    const MAPS = 'https://maps.app.goo.gl/NZ7zbYxNTpa6Mxpr6';
    const MUTE_KEY = 'mpc-pelusa-mute';
    const HOLA_KEY = 'mpc-pelusa-hola';
    const RAM_KEY = 'mpc_ram';

    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const enEmpresas = /empresas/.test(location.pathname);

    function track(name, params) {
        try { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); } catch (e) {}
    }
    function store(kind, key, value) {
        try {
            if (value === undefined) return window[kind].getItem(key);
            window[kind].setItem(key, value);
        } catch (e) { return null; }
    }
    function rand(min, max) { return min + Math.random() * (max - min); }
    function waLink(text) { return WA + '?text=' + encodeURIComponent(text); }
    function make(tag, cls, html) {
        const el = document.createElement(tag);
        if (cls) el.className = cls;
        if (html) el.innerHTML = html;
        return el;
    }
    function sleep(ms) {
        return new Promise(r => setTimeout(r, reduceMotion.matches ? Math.min(ms, 150) : ms));
    }

    // Horario (lo calcula horario.js)
    function horario() { return window.mpcHorario && window.mpcHorario.status ? window.mpcHorario : null; }
    function cerrado() { const h = horario(); return !!(h && h.status && !h.status.open); }
    // "Abro el lunes a las 10:00" (habla Mario) → "abre el lunes a las 10:00" (habla Pelusa)
    function enTercera(text) {
        return String(text || '')
            .replace(/\bAbro\b/g, 'Abre').replace(/\babro\b/g, 'abre')
            .replace(/\bCierro\b/g, 'Cierra').replace(/\bcierro\b/g, 'cierra')
            .replace(/\bVuelvo\b/g, 'Vuelve').replace(/\bvuelvo\b/g, 'vuelve');
    }

    // "Abierto ahora · Cierro a las 17:00" → "Ahora está abierto. Cierra a las 17:00."
    function estadoAhora(status) {
        const parts = String(status.label || '').split(' · ');
        const rest = parts.length > 1 ? ' ' + enTercera(parts.slice(1).join('. ')) + '.' : '';
        if (/^(Abierto|Cerrado)/.test(parts[0])) {
            return (status.open ? 'Ahora está abierto.' : 'Ahora está cerrado.') + rest;
        }
        return 'Ahora mismo: ' + enTercera(status.label);
    }

    // Respuestas
    // Cada tema: label (lo que dice la persona), y uno de estos:
    //   say: líneas de Pelusa (texto, o { text, cls }); también puede ser una función que devuelve las líneas.
    //   intro + menu: abre un submenú con esos temas.
    //   run: una animación del escáner (devuelve las opciones finales).
    // Opcionales: wa (mensaje armado para WhatsApp), links ([{ label, href }]), when (función: si da false, no se muestra).
    const RAM_NOTE = { text: 'Si tu PC anda lenta, con el diagnóstico sin cargo Mario te dice si le falta memoria o es otra cosa.', cls: 'note' };
    const RAM_JOKES = [
        {
            file: '$ descargar ram_gratis_16GB.exe',
            connect: 'Conectando con el servidor de RAM gratis...',
            install: 'Instalando 16 GB de RAM...',
            sub: () => 'La RAM no se descarga 😉',
            after: () => ['Te la creíste 😄', 'La RAM no se descarga: es una pieza que va adentro de la compu.', RAM_NOTE],
            wa: () => 'Hola Mario! Caí con lo de la RAM gratis 😅 Mi compu anda lenta, ¿la podés revisar?'
        },
        {
            file: '$ descargar ram_gratis_32GB_AHORA_SI.exe',
            connect: 'Buscando un servidor más confiable (?)...',
            install: 'Instalando 32 GB de RAM. Esta vez sí, posta...',
            sub: () => '¿Otra vez? 😂',
            after: () => ['Dos de dos 😂', 'Tranqui, a todos nos pasa con las ofertas demasiado buenas.', RAM_NOTE],
            wa: () => 'Hola Mario! Caí dos veces con lo de la RAM gratis 😂 ¿Me revisás la compu de verdad?'
        },
        {
            file: '$ descargar ram_gratis_64GB_final_v3.exe',
            connect: 'Desactivando el sentido común...',
            install: 'Instalando 64 GB de RAM y un poquito de fe...',
            sub: () => 'Tres de tres. Ya somos amigos 🤝',
            after: () => [
                'A esta altura Rick ya te saluda por tu nombre.',
                'Consejo de gato: si algo gratis en internet suena demasiado bueno, en la vida real suele ser un virus.',
                { text: 'Si sospechás que a tu compu se le metió algo, Mario la revisa y te dice qué tiene.', cls: 'note' }
            ],
            wa: () => 'Hola Mario! Caí tres veces con lo de la RAM gratis 🙈 ¿Me revisás la compu por si tiene algún virus?'
        },
        {
            file: '$ descargar ram_gratis_128GB.exe',
            connect: 'El escáner detectó un patrón sospechoso...',
            install: 'Igual lo voy a hacer. Me caés bien.',
            sub: n => 'Intento número ' + n + '. Esto ya es amor 💚',
            after: n => [
                n + ' veces. Sos fan de Rick y lo respeto.',
                'Lo que sí te aseguro es que Mario tampoco te va a dejar tirado con tu compu.',
                RAM_NOTE
            ],
            wa: n => 'Hola Mario! Caí ' + n + ' veces con lo de la RAM gratis 🎵 Ya que estamos, ¿me revisás la compu?'
        }
    ];

    const RESPUESTAS = {
        inicio: {
            menu: ['servicios', 'precios', 'donde', 'estado', 'empresas', 'escaner', 'otra']
        },

        // Servicios
        servicios: {
            label: '¿Qué arregla Mario?',
            intro: 'Arregla de todo un poco. ¿Qué querés saber?',
            menu: ['trabajos', 'ssd', 'archivos', 'windows', 'limpieza', 'marcas', 'lenta']
        },
        trabajos: {
            label: '¿Qué trabajos hace?',
            say: [
                'Mario pasa compus de disco rígido a SSD con todos tus datos, repara notebooks y PCs, formatea e instala Windows, Office y drivers, y hace limpieza y mantenimiento.',
                'También pone a punto celulares y tablets y arma PCs a medida.',
                'Y el diagnóstico siempre es sin cargo. Eso me lo sé de memoria 😼'
            ],
            wa: 'Hola Mario! Te escribo desde la web, quería consultarte por un arreglo.'
        },
        ssd: {
            label: '¿Cuánto tarda pasar a SSD?',
            say: [
                'Entre 24 y 48 horas, con la migración de datos, la limpieza interna y el mantenimiento incluidos.',
                'Depende de cómo llega el equipo y de cuántos datos haya que pasar. Igual, menos de lo que tardo yo en elegir dónde dormir la siesta.'
            ],
            wa: 'Hola Mario! Quería pasar mi compu a SSD, ¿me contás cómo es?'
        },
        archivos: {
            label: '¿Pierdo mis archivos con el SSD?',
            say: [
                'No. Mario pasa todo: Windows, programas y archivos. La compu queda igual que antes, pero más rápida.',
                'Igual conviene tener una copia de lo más importante, por las dudas. Yo escondo mis juguetes en dos lugares por lo mismo.'
            ],
            wa: 'Hola Mario! Quería pasar mi compu a SSD sin perder nada, ¿me contás cómo es?'
        },
        windows: {
            label: '¿Instala Windows y Office de cero?',
            say: [
                'Sí. Instala Windows, Office y los drivers actualizados, y deja todo configurado para que la compu ande bien desde el primer día.',
                'Antes respalda tus archivos, así no se pierde nada.'
            ],
            wa: 'Hola Mario! Quería formatear la compu e instalar Windows y Office de cero.'
        },
        limpieza: {
            label: '¿Cada cuánto conviene limpiar la compu?',
            say: [
                'Por lo menos una vez por año, y antes si se calienta mucho o hace ruido.',
                'Mario saca el polvo de adentro, cambia la pasta térmica del procesador y revisa que todo ande bien. Parte de ese polvo puede ser pelo mío, no te voy a mentir.'
            ],
            wa: 'Hola Mario! Quería hacerle una limpieza a mi compu.'
        },
        marcas: {
            label: '¿Qué marcas arregla?',
            say: [
                'Las más comunes: HP, Lenovo, ASUS, Acer, Dell, Samsung y Toshiba, entre otras.',
                'Mandale el modelo por WhatsApp antes de llevarla y te dice si la puede arreglar.'
            ],
            wa: 'Hola Mario! Quería saber si arreglás mi equipo. El modelo es: '
        },
        lenta: {
            label: '¿Por qué anda lenta mi PC?',
            say: [
                'Las causas más comunes de una PC lenta:',
                '1. Disco rígido viejo (HDD). Pasarlo a SSD suele ser el cambio que más se nota.\n2. Demasiados programas que arrancan con Windows.\n3. Poca memoria RAM para lo que usás.\n4. Polvo y pasta térmica vieja: el equipo se recalienta y se frena.\n5. Virus o malware escondidos.',
                { text: 'Con una revisión se sabe cuál es. El diagnóstico es sin cargo.', cls: 'note' }
            ],
            wa: 'Hola Mario! Mi PC anda lenta, ¿podés revisarla?'
        },

        // Precios
        precios: {
            label: '¿Cuánto sale?',
            intro: 'Hablemos de plata, aunque yo cobro en atún. ¿Qué querés saber?',
            menu: ['lista', 'pantalla', 'pago', 'garantia']
        },
        lista: {
            label: 'Ver la lista de precios',
            say: [
                'Estos son los precios "desde", en pesos:',
                'Diagnóstico: sin cargo\nPasar a SSD (con limpieza): $74.000\nFormateo e instalación: $65.000\nLimpieza y mantenimiento: $30.000\nEliminación de virus: $28.000\nReparación de hardware: $33.000\nArmado de PC a medida: $93.000\nCelulares y tablets: $30.000',
                'El precio final depende del equipo y de cómo llega. Mario te lo pasa por WhatsApp antes de arrancar, y si no te cierra, te devuelve la compu y no pagás nada.'
            ],
            wa: 'Hola Mario! Vi los precios en la web y quería consultarte por un trabajo.'
        },
        pantalla: {
            label: '¿Cuánto sale cambiar la pantalla de una notebook?',
            say: [
                'Depende de la marca y el modelo.',
                'Mandale el modelo a Mario por WhatsApp y te pasa el presupuesto sin cargo, con repuesto y mano de obra incluidos.'
            ],
            wa: 'Hola Mario! Quería presupuesto para cambiar la pantalla de mi notebook. El modelo es: '
        },
        pago: {
            label: '¿Cómo se paga?',
            say: [
                'En efectivo o con Mercado Pago.',
                'Le propuse a Mario aceptar atún, pero no quiso 😿'
            ]
        },
        garantia: {
            label: '¿Tiene garantía?',
            say: [
                'Sí: cada trabajo tiene 7 días de garantía.',
                'Y retirás el equipo con un informe de lo que se hizo.'
            ]
        },

        // Dónde, horarios y retiro
        donde: {
            label: '¿Dónde está y en qué horario?',
            intro: '¿Qué necesitás saber?',
            menu: ['ubicacion', 'horario', 'retiro']
        },
        ubicacion: {
            label: '¿Dónde está el taller?',
            say: [
                'En Alberdi y Maipú, Olivos, partido de Vicente López. Ahí vivo yo también.',
                'Mario atiende a gente de Olivos, La Lucila y zonas cercanas. Si no sabés si llega a tu zona, preguntale por WhatsApp.'
            ],
            links: [{ label: 'Abrir en Google Maps', href: MAPS, ext: true }],
            wa: 'Hola Mario! Quería coordinar para llevarte un equipo.'
        },
        horario: {
            label: '¿En qué horario atiende?',
            say: () => {
                const h = horario();
                const lines = [h && h.resumen
                    ? h.resumen
                    : 'Lunes a jueves de 10 a 17 h y viernes de 10 a 15 h. Sábados y domingos, cerrado.'];
                if (h && h.status && h.status.label) {
                    lines.push({ text: estadoAhora(h.status), cls: 'note' });
                }
                lines.push('Por WhatsApp le podés escribir cuando quieras. Si está cerrado, te responde apenas abre.');
                return lines;
            },
            wa: 'Hola Mario! Quería coordinar para llevarte un equipo.'
        },
        retiro: {
            label: '¿Retira el equipo o ayuda a distancia?',
            say: [
                'No. Todo se revisa y se arregla en el taller: le llevás el equipo y Mario te avisa por WhatsApp cuando está listo para retirar.',
                'Con las empresas es distinto: ahí sí retira los equipos. Preguntame por "Servicio para empresas".'
            ],
            wa: 'Hola Mario! Quería coordinar para llevarte un equipo.'
        },

        // Estado del equipo
        estado: {
            label: '¿Cómo va mi equipo?',
            say: [
                'Cuando dejás el equipo, Mario te da un código en el comprobante y por WhatsApp.',
                'Con ese código entrás a "Estado de tu equipo" y ves si está recibido, en reparación o listo para retirar.',
                'Igual te avisa por WhatsApp cuando está listo. Y yo lo vigilo desde arriba del escritorio.'
            ],
            links: [{ label: 'Ver el estado de mi equipo', href: '/estado.html' }],
            wa: 'Hola Mario! Quería saber cómo va mi equipo.'
        },

        // Empresas
        empresas: {
            label: 'Servicio para empresas',
            say: [
                'Mario retira los equipos que tu empresa ya no usa, borra los datos según NIST 800-88 y se ocupa del destino final.',
                'No te cobra el retiro ni el proceso: lo que tiene valor de reventa financia el servicio.',
                'Recibís un certificado por número de serie de cada equipo y un acta de retiro firmada. Lo que no se puede reutilizar va a reciclaje.',
                'Retira en Olivos, La Lucila, Vicente López y alrededores.'
            ],
            links: enEmpresas ? [] : [{ label: 'Ver el servicio para empresas', href: '/empresas.html' }],
            wa: 'Hola Mario! Te escribo por el servicio de retiro de equipos para empresas.'
        },

        // Lo que Pelusa no sabe
        otra: {
            label: 'Tengo otra pregunta',
            say: [
                'Eso no lo sé, soy un gato 🐾',
                'Preguntale a Mario por WhatsApp, que de compus sabe más que yo.'
            ],
            wa: 'Hola Mario! Tengo una consulta: '
        },

        // Escáner de PC (de mentirita)
        escaner: {
            label: 'Escaneá mi PC (de mentirita)',
            intro: 'Prendo el escáner. Es de mentirita, pero divertido. ¿Qué hacemos?',
            menu: ['scan', 'lenta', 'ping', 'sudo', 'ram'],
            scanner: true
        },
        scan: {
            label: 'Escanear mi PC',
            scanner: true,
            async run(c) {
                if (!await c.say([{ text: 'Iniciando escaneo...', cls: 'cmd' }], 400)) return null;
                if (!await c.bar(reduceMotion.matches ? [100] : [8, 19, 33, 33, 52, 68, 81, 94, 100], 330)) return null;
                const ok = await c.say([
                    { text: 'Pestañas abiertas: 3.482', cls: 'find' },
                    { text: 'Antivirus: vencido desde 2019', cls: 'find' },
                    { text: 'Fotos duplicadas de gatos: 47 (no las borres, por favor)', cls: 'find' },
                    { text: 'Archivos llamados "final_v2_AHORA_SÍ": 12', cls: 'find' },
                    { text: 'Programas que arrancan con Windows: 84 (usás 3)', cls: 'find' },
                    { text: 'Polvo en el ventilador: nivel alfombra', cls: 'find' },
                    { text: 'Sentido del humor: intacto', cls: 'good' },
                    'Diagnóstico: necesitás a Mario.',
                    { text: 'Ojo: este escáner es de mentirita. El diagnóstico de verdad lo hace Mario en el taller y es sin cargo.', cls: 'note' }
                ], 650);
                if (!ok) return null;
                return [c.wa('Pedir diagnóstico sin cargo', 'Hola Mario! Probé el escáner de la web y dice que te necesito 😅 ¿Me hacés un diagnóstico?')];
            }
        },
        ping: {
            label: 'Ping a Mario',
            scanner: true,
            async run(c) {
                const ok = await c.say([
                    { text: '$ ping mariopc.com.ar', cls: 'cmd' },
                    { text: 'Respuesta de Mario: tiempo=12 ms', cls: 'cmd' },
                    { text: 'Respuesta de Mario: tiempo=11 ms', cls: 'cmd' },
                    { text: 'Respuesta de Mario: tiempo=12 ms', cls: 'cmd' },
                    'Paquetes: enviados = 3, recibidos = 3, perdidos = 0 (0% perdidos)'
                ], 520);
                if (!ok) return null;
                const h = horario();
                const estado = h && h.status && h.status.label
                    ? estadoAhora(h.status)
                    : 'Escribile por WhatsApp y te responde apenas pueda.';
                if (!await c.say([{ text: estado, cls: 'note' }], 300)) return null;
                return [c.wa('Escribirle a Mario', 'Hola Mario! Hice ping desde la web y respondiste en 12 ms 😄 Quería consultarte algo.')];
            }
        },
        sudo: {
            label: 'sudo reparar',
            scanner: true,
            async run(c) {
                const ok = await c.say([
                    { text: '$ sudo reparar', cls: 'cmd' },
                    { text: 'Contraseña: ********', cls: 'cmd' },
                    { text: 'Error: permiso denegado.', cls: 'find' },
                    'Tu usuario no tiene permisos para reparar esto. Mario sí 😎'
                ], 650);
                if (!ok) return null;
                return [c.wa('Escribirle a Mario', 'Hola Mario! El escáner dice que solo vos podés repararme la PC 😅')];
            }
        },
        ram: {
            label: 'Descargar más RAM gratis',
            scanner: true,
            when: () => typeof window.openRickroll === 'function',
            async run(c) {
                const tries = (parseInt(store('sessionStorage', RAM_KEY), 10) || 0) + 1;
                store('sessionStorage', RAM_KEY, String(tries));
                const v = RAM_JOKES[Math.min(tries, RAM_JOKES.length) - 1];
                if (!await c.say([{ text: v.file, cls: 'cmd' }, { text: v.connect, cls: 'cmd' }], 500)) return null;
                if (!await c.bar(reduceMotion.matches ? [100] : [14, 31, 47, 66, 82, 97, 99, 99, 100], 260)) return null;
                if (!await c.say([{ text: v.install, cls: 'cmd' }], 700)) return null;
                if (typeof window.openRickroll !== 'function') return null;
                track('rickroll_visto', { intento: tries });
                await new Promise(resolve => window.openRickroll({ sub: v.sub(tries), onClose: resolve }));
                if (!c.alive()) return null;
                if (!await c.say(v.after(tries), 600)) return null;
                return [c.wa('Que Mario la revise', v.wa(tries))];
            }
        }
    };

    // Sonido (igual que el flashbang de theme.js)
    let ctx = null;
    const buffers = {};
    let soundTurn = 0;

    function muted() { return store('localStorage', MUTE_KEY) === '1'; }

    function audio() {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        if (!ctx) ctx = new AC();
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    function prefetch() {
        SONIDOS.forEach(url => {
            if (buffers[url]) return;
            buffers[url] = { data: fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).catch(() => null) };
        });
    }

    function synthMeow(c) {
        const t = c.currentTime;
        const out = c.createGain();
        out.gain.setValueAtTime(0, t);
        out.gain.linearRampToValueAtTime(VOLUME * 0.9, t + 0.06);
        out.gain.setValueAtTime(VOLUME * 0.9, t + 0.32);
        out.gain.exponentialRampToValueAtTime(0.001, t + 0.62);
        out.connect(c.destination);

        const o = c.createOscillator();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(480, t);
        o.frequency.linearRampToValueAtTime(820, t + 0.16);
        o.frequency.exponentialRampToValueAtTime(420, t + 0.6);

        const f = c.createBiquadFilter();
        f.type = 'bandpass';
        f.Q.value = 3;
        f.frequency.setValueAtTime(900, t);
        f.frequency.linearRampToValueAtTime(2000, t + 0.15);
        f.frequency.exponentialRampToValueAtTime(800, t + 0.6);

        o.connect(f).connect(out);
        o.start(t);
        o.stop(t + 0.65);
    }

    function meow() {
        if (muted()) return;
        const c = audio();
        if (!c) return;
        if (!SONIDOS.length) { synthMeow(c); return; }
        const url = SONIDOS[soundTurn++ % SONIDOS.length];
        prefetch();
        const entry = buffers[url];
        const play = b => {
            if (!b) return;
            const src = c.createBufferSource();
            const g = c.createGain();
            g.gain.value = VOLUME;
            src.buffer = b;
            src.connect(g).connect(c.destination);
            src.start();
        };
        if (entry.buffer) { play(entry.buffer); return; }
        entry.data.then(data => {
            if (!data) return;
            c.decodeAudioData(data.slice(0), b => { entry.buffer = b; play(b); }, () => {});
        });
    }

    // Íconos
    const ICON = {
        x: '<svg viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128L50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z"/></svg>',
        sound: '<svg viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M155.51 24.81a8 8 0 0 0-8.42.88L77.25 80H32a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h45.25l69.84 54.31A8 8 0 0 0 160 224V32a8 8 0 0 0-4.49-7.19M144 207.64l-59.09-46a8 8 0 0 0-4.91-1.64H32V96h48a8 8 0 0 0 4.91-1.69l59.09-46ZM200 128a40 40 0 0 1-12 28.57a8 8 0 1 1-11.26-11.36a24 24 0 0 0 0-34.42A8 8 0 1 1 188 99.43A40 40 0 0 1 200 128m40 0a80 80 0 0 1-24.37 57.44a8 8 0 0 1-11.17-11.44a64 64 0 0 0 0-92a8 8 0 0 1 11.17-11.44A80 80 0 0 1 240 128"/></svg>',
        mute: '<svg viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M155.51 24.81a8 8 0 0 0-8.42.88L77.25 80H32a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h45.25l69.84 54.31A8 8 0 0 0 160 224V32a8 8 0 0 0-4.49-7.19M144 207.64l-59.09-46a8 8 0 0 0-4.91-1.64H32V96h48a8 8 0 0 0 4.91-1.69l59.09-46Zm101.66-61.3a8 8 0 0 1-11.32 11.32L216 139.31l-18.34 18.35a8 8 0 0 1-11.32-11.32L204.69 128l-18.35-18.34a8 8 0 0 1 11.32-11.32L216 116.69l18.34-18.35a8 8 0 0 1 11.32 11.32L227.31 128Z"/></svg>',
        wa: '<svg viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="m152.58 145.23l23 11.48A24 24 0 0 1 152 176a72.08 72.08 0 0 1-72-72a24 24 0 0 1 19.29-23.54l11.48 23L101 118a8 8 0 0 0-.73 7.51a56.47 56.47 0 0 0 30.15 30.15A8 8 0 0 0 138 155ZM232 128a104 104 0 0 1-152.88 91.82l-34.05 11.35a16 16 0 0 1-20.24-20.24l11.35-34.05A104 104 0 1 1 232 128m-40 24a8 8 0 0 0-4.42-7.16l-32-16a8 8 0 0 0-8 .5l-14.69 9.8a40.55 40.55 0 0 1-16-16l9.8-14.69a8 8 0 0 0 .5-8l-16-32A8 8 0 0 0 104 64a40 40 0 0 0-40 40a88.1 88.1 0 0 0 88 88a40 40 0 0 0 40-40"/></svg>'
    };

    // Botón flotante (arriba del de WhatsApp)
    root.classList.add('has-pelusa');
    const dock = make('div', 'pelusa-dock');
    const fab = make('button', 'pelusa-fab',
        '<img class="pelusa-face" src="' + IMG.normal + '" alt="" width="58" height="58" decoding="async">' +
        '<img class="pelusa-face is-sleep" src="' + IMG.durmiendo + '" alt="" width="58" height="58" loading="lazy" decoding="async">' +
        '<span class="wa-zzz pelusa-zzz" aria-hidden="true"><span>Z</span><span>Z</span><span>Z</span></span>');
    fab.type = 'button';
    fab.setAttribute('aria-haspopup', 'dialog');
    fab.setAttribute('aria-expanded', 'false');
    const hola = make('button', 'pelusa-hola');
    hola.type = 'button';
    hola.tabIndex = -1;
    hola.setAttribute('aria-hidden', 'true');
    dock.appendChild(hola);
    dock.appendChild(fab);
    document.body.appendChild(dock);

    function fabLabel() {
        fab.setAttribute('aria-label', cerrado()
            ? 'Preguntale a Pelusa, el gato de Mario (está durmiendo, pero responde)'
            : 'Preguntale a Pelusa, el gato de Mario');
    }
    fabLabel();
    window.addEventListener('mpc:horario', fabLabel);

    ['pointerenter', 'focus', 'touchstart'].forEach(ev => fab.addEventListener(ev, prefetch, { once: true, passive: true }));
    fab.addEventListener('click', () => (isOpen ? close() : open()));
    hola.addEventListener('click', () => open());

    // Globito "¿Te ayudo?": una sola vez por visita, a los 6 s con la pestaña a la vista
    if (store('sessionStorage', HOLA_KEY) !== '1') {
        let visible = 0;
        const tick = setInterval(() => {
            if (document.hidden) return;
            visible += 500;
            if (visible < 6000) return;
            clearInterval(tick);
            if (isOpen || store('sessionStorage', HOLA_KEY) === '1') return;
            store('sessionStorage', HOLA_KEY, '1');
            hola.textContent = cerrado() ? 'Zzz… igual te ayudo 🐾' : '¿Te ayudo? 🐾';
            dock.classList.add('is-hola');
            setTimeout(() => dock.classList.remove('is-hola'), 6500);
        }, 500);
    }

    // Ventana de chat
    let panel = null;
    let log = null;
    let opts = null;
    let muteBtn = null;
    let isOpen = false;
    let runId = 0;
    let busy = false;
    let interrupted = false;
    let group = null;
    let currentMenu = 'inicio';
    let prevFocus = null;

    function build() {
        panel = make('div', 'pelusa-panel',
            '<div class="pelusa-head">' +
                '<img class="pelusa-head-face" src="' + IMG.normal + '" alt="Pelusa, el gato de Mario" width="44" height="44">' +
                '<div class="pelusa-head-text"><strong id="pelusaTitle">Pelusa</strong><span class="pelusa-head-sub"></span></div>' +
                '<button type="button" class="pelusa-icon-btn pelusa-mute"></button>' +
                '<button type="button" class="pelusa-icon-btn pelusa-close" aria-label="Cerrar a Pelusa">' + ICON.x + '</button>' +
            '</div>' +
            '<div class="pelusa-log" role="log" aria-live="polite" aria-relevant="additions"></div>' +
            '<div class="pelusa-opts"></div>');
        panel.hidden = true;
        panel.tabIndex = -1;
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('aria-labelledby', 'pelusaTitle');
        log = panel.querySelector('.pelusa-log');
        opts = panel.querySelector('.pelusa-opts');
        muteBtn = panel.querySelector('.pelusa-mute');
        panel.querySelector('.pelusa-close').addEventListener('click', close);
        muteBtn.addEventListener('click', () => {
            const next = !muted();
            store('localStorage', MUTE_KEY, next ? '1' : '0');
            track('pelusa_silencio', { silencio: next });
            paintMute();
        });
        panel.addEventListener('keydown', trapTab);
        paintMute();
        document.body.appendChild(panel);
    }

    function paintMute() {
        const m = muted();
        muteBtn.innerHTML = m ? ICON.mute : ICON.sound;
        muteBtn.setAttribute('aria-pressed', String(m));
        muteBtn.setAttribute('aria-label', m ? 'Activar el miau' : 'Silenciar el miau');
        muteBtn.title = m ? 'Activar el miau' : 'Silenciar el miau';
    }

    function paintHead() {
        panel.querySelector('.pelusa-head-sub').textContent = cerrado()
            ? 'Dormido, pero responde'
            : 'El gato de Mario';
    }

    function trapTab(e) {
        if (e.key !== 'Tab') return;
        const f = panel.querySelectorAll('button:not([disabled]), a[href]');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (!panel.contains(document.activeElement) || document.activeElement === panel) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function open() {
        if (isOpen) return;
        if (!panel) build();
        isOpen = true;
        prevFocus = document.activeElement;
        dock.classList.remove('is-hola');
        store('sessionStorage', HOLA_KEY, '1');
        paintHead();
        panel.hidden = false;
        root.classList.add('pelusa-open');
        fab.setAttribute('aria-expanded', 'true');
        requestAnimationFrame(() => panel.classList.add('is-open'));
        meow();
        track('pelusa_abierta', { cerrado: cerrado() });
        try { panel.focus({ preventScroll: true }); } catch (e) {}

        if (!log.childNodes.length) greet();
        else if (interrupted) {
            interrupted = false;
            pelusa('¿En qué estábamos? Ah, sí:');
            showMenu('inicio');
        }
    }

    function close() {
        if (!isOpen) return;
        isOpen = false;
        if (busy) interrupted = true;
        runId++;
        busy = false;
        panel.classList.remove('is-open');
        root.classList.remove('pelusa-open');
        fab.setAttribute('aria-expanded', 'false');
        setTimeout(() => { if (!isOpen) panel.hidden = true; }, reduceMotion.matches ? 0 : 180);
        const back = prevFocus && document.contains(prevFocus) && prevFocus !== document.body ? prevFocus : fab;
        try { back.focus({ preventScroll: true }); } catch (e) {}
    }

    // En captura, para ver el rickroll antes de que el Esc del inicio lo cierre: ese Esc es solo para el video
    window.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || !isOpen) return;
        const rick = document.getElementById('rickrollOverlay');
        if (rick && rick.classList.contains('active')) return;
        close();
    }, true);

    // Mensajes
    function bubble(text, cls) {
        const b = make('div', 'pelusa-msg' + (cls ? ' ' + cls : ''));
        b.textContent = text;
        return b;
    }

    function scrollDown() { log.scrollTop = log.scrollHeight; }

    function pelusa(text, cls) {
        if (!group) {
            const row = make('div', 'pelusa-row',
                '<img class="pelusa-row-face" src="' + IMG.normal + '" alt="" width="30" height="30">');
            group = make('div', 'pelusa-col');
            row.appendChild(group);
            log.appendChild(row);
        }
        const b = bubble(text, cls);
        group.appendChild(b);
        scrollDown();
        return b;
    }

    function me(text) {
        group = null;
        const row = make('div', 'pelusa-row is-me');
        row.appendChild(bubble(text, 'is-me'));
        log.appendChild(row);
        scrollDown();
    }

    async function think(id) {
        group = null;
        const row = make('div', 'pelusa-row is-typing',
            '<img class="pelusa-row-face" src="' + IMG.pensando + '" alt="" width="30" height="30">' +
            '<div class="pelusa-col"><div class="pelusa-msg pelusa-dots" aria-label="Pelusa está pensando"><span></span><span></span><span></span></div></div>');
        log.appendChild(row);
        scrollDown();
        await sleep(rand(600, 1200));
        row.remove();
        return id === runId;
    }

    async function say(lines, id, gap) {
        for (let i = 0; i < lines.length; i++) {
            if (id !== runId) return false;
            const it = lines[i];
            if (typeof it === 'string') pelusa(it); else pelusa(it.text, it.cls);
            if (i < lines.length - 1) await sleep(gap || 650);
        }
        return id === runId;
    }

    function bar(id) {
        return async (steps, ms) => {
            const wrap = pelusa('', 'pelusa-bar');
            wrap.setAttribute('aria-hidden', 'true');
            const fill = make('span');
            wrap.appendChild(fill);
            for (const p of steps) {
                if (id !== runId) return false;
                fill.style.width = p + '%';
                await sleep(ms);
            }
            return id === runId;
        };
    }

    // Opciones
    function setOptions(list, disabled) {
        opts.innerHTML = '';
        list.forEach(o => {
            let node;
            if (o.href) {
                node = make('a', 'pelusa-opt' + (o.cta ? ' is-cta' : ''));
                node.href = o.href;
                if (o.ext) { node.target = '_blank'; node.rel = 'noopener noreferrer'; }
                if (o.onClick) node.addEventListener('click', o.onClick);
                if (disabled) { node.setAttribute('aria-disabled', 'true'); node.tabIndex = -1; }
            } else {
                node = make('button', 'pelusa-opt');
                node.type = 'button';
                if (disabled) node.disabled = true;
                else node.addEventListener('click', o.onClick);
            }
            if (o.cta) node.insertAdjacentHTML('afterbegin', ICON.wa);
            node.appendChild(document.createTextNode(o.label));
            opts.appendChild(node);
        });
        if (!disabled) {
            const first = opts.querySelector('.pelusa-opt');
            if (first && panel.contains(document.activeElement)) { try { first.focus({ preventScroll: true }); } catch (e) {} }
        }
    }

    function waOption(label, text, origen, scanner) {
        return {
            label, cta: true, ext: true, href: waLink(text),
            onClick: () => {
                track('pelusa_whatsapp', { origen });
                if (scanner) track('escaner_whatsapp', { origen });
            }
        };
    }

    function menuOptions(key) {
        const node = RESPUESTAS[key];
        const list = node.menu
            .filter(k => RESPUESTAS[k] && (!RESPUESTAS[k].when || RESPUESTAS[k].when()))
            .map(k => ({ label: RESPUESTAS[k].label, onClick: () => ask(k, key) }));
        if (key !== 'inicio') list.push({ label: 'Volver al menú', onClick: () => back('inicio') });
        return list;
    }

    function showMenu(key) {
        currentMenu = key;
        setOptions(menuOptions(key));
    }

    function back(key) {
        runId++;
        busy = false;
        pelusa('¿Qué más querés saber?');
        showMenu(key);
    }

    function afterOptions(key, from, extra) {
        const node = RESPUESTAS[key];
        const list = (extra || []).slice();
        if (node.links) node.links.forEach(l => list.push({ label: l.label, href: l.href, ext: !!l.ext }));
        if (node.wa) list.push(waOption('Hablar con Mario por WhatsApp', node.wa, key, node.scanner));
        if (from !== 'inicio') list.push({ label: 'Volver', onClick: () => back(from) });
        list.push({ label: 'Menú principal', onClick: () => back('inicio') });
        return list;
    }

    async function ask(key, from) {
        const node = RESPUESTAS[key];
        const id = ++runId;
        busy = true;
        track('pelusa_pregunta', { tema: key });
        if (node.scanner) track('escaner_opcion', { opcion: key });
        me(node.label);
        setOptions(menuOptions(currentMenu), true);
        if (!await think(id)) return;

        let extra = null;
        if (node.menu) {
            if (!await say([node.intro], id)) return;
            busy = false;
            showMenu(key);
            return;
        }
        if (node.run) {
            const c = {
                say: (lines, gap) => say(lines, id, gap),
                bar: bar(id),
                alive: () => id === runId,
                wa: (label, text) => waOption(label, text, key, true)
            };
            extra = await node.run(c);
            if (!extra || id !== runId) return;
        } else {
            const lines = typeof node.say === 'function' ? node.say() : node.say;
            if (!await say(lines, id)) return;
        }
        busy = false;
        setOptions(afterOptions(key, from, extra));
    }

    async function greet() {
        const id = ++runId;
        busy = true;
        setOptions(menuOptions('inicio'), true);
        await sleep(350);
        let lines;
        if (cerrado()) {
            const h = horario();
            lines = [
                'Zzz… ¡ah, hola! Soy Pelusa, el gato de Mario.',
                'Mario ya cerró por ahora, pero yo te respondo igual.'
            ];
            if (h.status.when) lines.push({ text: enTercera(h.status.when) + '.', cls: 'note' });
            lines.push('¿Qué querés saber?');
        } else {
            lines = [
                'Hola, soy Pelusa, el gato de Mario.',
                'Mientras él arregla compus, yo atiendo. ¿Qué querés saber?'
            ];
        }
        if (!await say(lines, id, 550)) return;
        busy = false;
        showMenu('inicio');
    }
})();
