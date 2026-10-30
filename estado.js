// Mario PC: página "Estado de tu equipo". Lee el código del link (va después del #, así no llega a ningún servidor),
// se lo pregunta al Worker del portal en el cuerpo de un POST y muestra lo que devuelve.
(function () {
    const API = /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
        ? 'http://127.0.0.1:8787/v1'
        : 'https://mariopc-estado.PENDIENTE.workers.dev/v1';
    const WSP = 'https://wa.me/5491123999259';
    const CODIGO = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{12}$/;
    const PASOS = ['recibido', 'en_curso', 'listo', 'entregado'];
    const VISTAS = ['v-pedir', 'v-cargando', 'v-ficha', 'v-no', 'v-error'];

    const $ = (id) => document.getElementById(id);
    let codigo = '';

    const normalizar = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const conGuiones = (c) => c.slice(0, 4) + '-' + c.slice(4, 8) + '-' + c.slice(8);

    // '2026-10-29' → '29/10' (con el año si no es el actual)
    function fecha(iso) {
        const [a, m, d] = iso.split('-');
        return d + '/' + m + (+a !== new Date().getFullYear() ? '/' + a : '');
    }
    function cuando(ms) {
        const t = new Date(ms);
        const opts = { timeZone: 'America/Argentina/Buenos_Aires' };
        const dia = t.toLocaleDateString('es-AR', Object.assign({ day: '2-digit', month: '2-digit' }, opts));
        const hora = t.toLocaleTimeString('es-AR', Object.assign({ hour: '2-digit', minute: '2-digit', hour12: false }, opts));
        return 'Actualizado el ' + dia + ' a las ' + hora + '.';
    }

    function mostrar(id, enfocar) {
        VISTAS.forEach((v) => { $(v).hidden = v !== id; });
        if (!enfocar) return;
        const h = $(id).querySelector('h1');
        if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }

    // Títulos fijos (con el énfasis en verde); lo que viene del servidor va siempre como texto
    function titulo(d) {
        if (d.estado === 'entregado') return ['<em>Entregado</em>', 'Lo retiraste el ' + fecha(d.entregado) + '. Gracias por traerlo.'];
        if (d.estado === 'listo') return ['Listo para <em>retirar</em>', 'Ya está. Pasá a buscarlo cuando puedas.'];
        if (d.espera === 'repuesto') return ['En <em>espera</em>', 'Estoy esperando un repuesto. Apenas llega, sigo.'];
        if (d.espera === 'confirma') return ['En <em>espera</em>', 'Necesito que me confirmes el presupuesto para seguir.'];
        if (d.estado === 'en_curso') return ['En <em>reparación</em>', 'Estoy trabajando en tu equipo.'];
        return ['<em>Recibido</em>', 'Ya lo tengo en el taller. Todavía no lo empecé.'];
    }

    function pintar(d, act, enfocar) {
        const [t, texto] = titulo(d);
        $('f-titulo').innerHTML = t;
        $('f-texto').textContent = texto;

        const aviso = d.estado === 'listo' && d.guarda
            ? 'Retiralo antes del ' + fecha(d.guarda) + '. Desde ese día se cobra guarda.'
            : '';
        $('f-aviso').textContent = aviso;
        $('f-aviso').hidden = !aviso;

        const actual = PASOS.indexOf(d.estado);
        $('f-pasos').querySelectorAll('li').forEach((li, i) => {
            li.classList.toggle('hecho', i < actual);
            li.classList.toggle('actual', i === actual);
            if (i === actual) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        });

        const filas = [];
        if (d.equipo) filas.push(['Equipo', d.equipo]);
        if (d.recibido) filas.push(['Lo dejaste el', fecha(d.recibido)]);
        if (d.entrega && actual < 2) filas.push(['Entrega estimada', fecha(d.entrega)]);
        if (d.listo && d.estado === 'listo') filas.push(['Listo desde', fecha(d.listo)]);
        const dl = $('f-datos');
        dl.replaceChildren(...filas.map(([k, v]) => {
            const fila = document.createElement('div');
            const dt = document.createElement('dt');
            const dd = document.createElement('dd');
            dt.textContent = k;
            dd.textContent = v;
            if (k === 'Equipo') dd.className = 'texto';
            fila.append(dt, dd);
            return fila;
        }));
        dl.hidden = !filas.length;

        // El código no va en el mensaje: el link de WhatsApp pasa por los servidores de Meta
        const msg = d.espera === 'confirma' && actual < 2
            ? 'Hola Mario, te escribo por el presupuesto de mi equipo.'
            : 'Hola Mario, te escribo por mi equipo.';
        $('f-wsp').href = WSP + '?text=' + encodeURIComponent(msg);
        $('f-act').textContent = act ? cuando(act) : '';
        $('f-codigo').textContent = conGuiones(codigo);
        mostrar('v-ficha', enfocar);
    }

    function error(t, texto, enfocar) {
        $('e-titulo').innerHTML = t;
        $('e-texto').textContent = texto;
        mostrar('v-error', enfocar);
    }

    async function consultar(enfocar) {
        mostrar('v-cargando');
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 6000);
        try {
            const r = await fetch(API, {
                method: 'POST',
                body: JSON.stringify({ c: codigo }),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                cache: 'no-store',
                credentials: 'omit',
                referrerPolicy: 'no-referrer',
                signal: ctrl.signal
            });
            if (r.status === 404) return mostrar('v-no', enfocar);
            if (r.status === 429) return error('Esperá un <em>minuto</em>', 'Hiciste muchas consultas seguidas. Probá de nuevo en un rato.', enfocar);
            const j = await r.json();
            if (!r.ok || !j.ok || !j.d) throw new Error('respuesta');
            pintar(j.d, j.act, enfocar);
        } catch (e) {
            error('No pude <em>conectarme</em>', 'Revisá tu conexión y probá de nuevo.', enfocar);
        } finally {
            clearTimeout(timer);
        }
    }

    function pedir(valor, conError) {
        const input = $('codigo');
        input.value = valor || '';
        $('codigo-error').hidden = !conError;
        input.setAttribute('aria-invalid', conError ? 'true' : 'false');
        mostrar('v-pedir');
    }

    function desdeLink() {
        let crudo = location.hash.slice(1);
        try { crudo = decodeURIComponent(crudo); } catch (e) {}
        const c = normalizar(crudo);
        if (CODIGO.test(c)) { codigo = c; consultar(false); }
        else pedir(crudo, !!crudo);
    }

    $('form-codigo').addEventListener('submit', (e) => {
        e.preventDefault();
        const c = normalizar($('codigo').value);
        if (!CODIGO.test(c)) { pedir($('codigo').value, true); $('codigo').focus(); return; }
        codigo = c;
        // queda en la barra para poder recargar o guardar el link; con replaceState no suma pasos al historial
        history.replaceState(null, '', '#' + conGuiones(c));
        consultar(true);
    });
    document.querySelectorAll('[data-otro]').forEach((b) => b.addEventListener('click', () => {
        codigo = '';
        history.replaceState(null, '', location.pathname);
        pedir('', false);
        $('codigo').focus();
    }));
    $('f-actualizar').addEventListener('click', () => consultar(true));
    $('e-reintentar').addEventListener('click', () => consultar(true));
    window.addEventListener('hashchange', desdeLink);

    desdeLink();
})();
