// Mario PC: todo lo que pasa cuando el modo 2002 está activo. Lo carga retro.js recién cuando alguien
// prende el modo, así el resto de las visitas no lo baja. Los estilos están en retro.css. Ver RETRO.md.
//
// Qué hay acá: cartel "se ve mejor con...", marquesina, secciones como ventanas (minimizar, maximizar,
// cerrar), barra de tareas con menú Inicio y reloj, WhatsApp como ventana de chat con zumbido,
// contador y botoncitos del pie, blog como fotolog, estado como pantalla de DOS, fotos que bajan
// como con módem, estela del cursor, protector de pantalla, música chiptune y el sonido del módem.
(function () {
    'use strict';

    // Lo que se puede cambiar sin tocar el resto
    var CONFIG = {
        // Contador del pie: equipos reparados. Es un dato real, actualizarlo a mano (0 lo oculta).
        reparados: 70,
        // Segundos con la página a la vista antes del zumbido del chat (una vez por visita)
        zumbidoSeg: 20,
        // Segundos sin mover el mouse ni tocar el teclado antes del protector de pantalla
        protectorSeg: 90,
        // Sonidos (archivos en la raíz del repo) y volúmenes de 0 a 1, nivelados con el flashbang,
        // el yoooo y el miau de Pelusa: si cambiás un archivo, medilo y nivelalo de nuevo (ver RETRO.md)
        sonidoModem: '/modem.mp3?v=1',
        volumenModem: 0.85,
        sonidoApagado: '/apagado.mp3?v=1',
        volumenApagado: 0.45,
        // Volumen de la música chiptune (sintetizada, sin archivo)
        volumenMusica: 0.06,
        wa: 'https://wa.me/5491123999259'
    };

    var root = document.documentElement;
    var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var finePointer = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    var started = false;
    var cleanups = [];

    // ---------- Ayudas ----------
    function make(tag, cls, html) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (html !== undefined) n.innerHTML = html;
        return n;
    }
    function listen(target, type, fn, opts) {
        target.addEventListener(type, fn, opts);
        cleanups.push(function () { target.removeEventListener(type, fn, opts); });
    }
    function addNode(node) {
        cleanups.push(function () { if (node.parentNode) node.parentNode.removeChild(node); });
        return node;
    }
    function every(fn, ms) {
        var id = setInterval(fn, ms);
        cleanups.push(function () { clearInterval(id); });
        return id;
    }
    function later(fn, ms) {
        var id = setTimeout(fn, ms);
        cleanups.push(function () { clearTimeout(id); });
        return id;
    }
    function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
    function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
    function clean(text) { return (text || '').replace(/\s+/g, ' ').trim(); }

    var ICON = {
        win: '<svg class="retro-titlebar-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="1" y="2" width="14" height="10" fill="#c0c0c0" stroke="#000"/><rect x="3" y="4" width="10" height="6" fill="#008080"/><rect x="5" y="12" width="6" height="2" fill="#808080"/></svg>',
        min: '<svg viewBox="0 0 10 10" aria-hidden="true"><rect x="1" y="7" width="6" height="2" fill="currentColor"/></svg>',
        max: '<svg viewBox="0 0 10 10" aria-hidden="true"><rect x="1.5" y="1.5" width="7" height="7" fill="none" stroke="currentColor"/><rect x="1" y="1" width="8" height="2" fill="currentColor"/></svg>',
        x: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" stroke-width="1.8"/></svg>',
        sound: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor"/><path d="M11 5.5c1 .8 1 4.2 0 5M12.8 4c2 1.6 2 6.4 0 8" stroke="currentColor" fill="none" stroke-width="1.2"/></svg>',
        chat: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 2.5h13v8h-7l-3.5 3v-3H1.5z" fill="#ffffff" stroke="#000"/><path d="M4 5.5h8M4 7.5h5" stroke="#000080"/></svg>',
        modem: '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="2" y="6" width="16" height="12" fill="#c0c0c0" stroke="#000"/><rect x="4" y="8" width="12" height="8" fill="#008080"/><rect x="22" y="6" width="16" height="12" fill="#c0c0c0" stroke="#000"/><rect x="24" y="8" width="12" height="8" fill="#008080"/><path d="M10 18v8h20v-8" fill="none" stroke="#000" stroke-dasharray="2 2"/><rect x="14" y="26" width="12" height="8" fill="#ffffe1" stroke="#000"/></svg>',
        menu: {
            home: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 10L10 3l8 7v7H2z" fill="#ffffe1" stroke="#000"/><rect x="8" y="12" width="4" height="5" fill="#a00000"/></svg>',
            list: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="2" width="14" height="16" fill="#fff" stroke="#000"/><path d="M6 6h8M6 9h8M6 12h8M6 15h5" stroke="#000080"/></svg>',
            ask: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="#ffff00" stroke="#000"/><text x="10" y="14.5" text-anchor="middle" font-family="Arial" font-weight="700" font-size="12" fill="#000">?</text></svg>',
            note: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="3" width="14" height="14" fill="#fff" stroke="#000"/><rect x="5" y="5" width="10" height="6" fill="#66ccff"/><path d="M5 13.5h10" stroke="#000"/></svg>',
            work: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="4" width="14" height="14" fill="#c0c0c0" stroke="#000"/><path d="M6 7h2M12 7h2M6 10h2M12 10h2M6 13h2M12 13h2" stroke="#000080" stroke-width="1.5"/></svg>',
            pc: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="3" width="16" height="11" fill="#c0c0c0" stroke="#000"/><rect x="4" y="5" width="12" height="7" fill="#000"/><path d="M5 7h4" stroke="#00ff00"/><rect x="7" y="14" width="6" height="3" fill="#808080"/></svg>',
            chat: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 3h16v10H9l-4 4v-4H2z" fill="#1fbf3a" stroke="#000"/></svg>',
            music: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 15V4l9-2v11" fill="none" stroke="#000" stroke-width="1.5"/><circle cx="5" cy="15" r="2.5" fill="#000080"/><circle cx="14" cy="13" r="2.5" fill="#000080"/></svg>',
            power: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="11" r="6.5" fill="none" stroke="#a00000" stroke-width="2"/><path d="M10 2v8" stroke="#a00000" stroke-width="2"/></svg>'
        }
    };

    function titlebar(title, opts) {
        opts = opts || {};
        var bar = make('div', 'retro-titlebar');
        bar.insertAdjacentHTML('beforeend', ICON.win);
        var t = make('span', 'retro-titlebar-text');
        t.textContent = title;
        bar.appendChild(t);
        if (opts.buttons) {
            var btns = make('span', 'retro-titlebar-btns');
            [['min', 'Minimizar'], ['max', 'Maximizar'], ['x', 'Cerrar']].forEach(function (b) {
                var btn = make('button', '', ICON[b[0]]);
                btn.type = 'button';
                btn.setAttribute('aria-label', b[1] + ' «' + title + '»');
                btn.dataset.act = b[0];
                btns.appendChild(btn);
            });
            bar.appendChild(btns);
        }
        return bar;
    }

    // ¿Hay algo abierto encima? (para no tirar el zumbido ni el protector en el medio)
    var startMenuOpen = false;
    function somethingOpen() {
        var a = document.activeElement;
        return !!(startMenuOpen ||
            root.classList.contains('pelusa-open') ||
            document.querySelector('.egg-bsod, .egg-modal, .rickroll-overlay.active, .retro-off, .retro-dialup, .retro-saver') ||
            (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)));
    }

    // ---------- Color de la barra del navegador ----------
    function setupThemeColor() {
        var meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) return;
        var prev = meta.getAttribute('content');
        meta.setAttribute('content', '#000080');
        cleanups.push(function () { meta.setAttribute('content', prev); });
    }

    // ---------- Cartel y marquesinas ----------
    function marquee(text, cls) {
        var m = make('div', 'retro-marquee' + (cls ? ' ' + cls : ''));
        m.setAttribute('aria-hidden', 'true');
        var s = make('span');
        s.textContent = text;
        m.appendChild(s);
        return m;
    }

    function setupBanners() {
        var best = addNode(make('div', 'retro-best'));
        best.setAttribute('aria-hidden', 'true');
        best.textContent = 'Esta página se ve mejor con Internet Explorer 6.0 a 800x600 y color de 16 bits';
        document.body.insertBefore(best, document.body.firstChild);

        var top = addNode(marquee('*** BIENVENIDOS A LA PÁGINA OFICIAL DE MARIO PC *** DIAGNÓSTICO SIN CARGO *** PASÁ TU COMPU A SSD Y VOLÁ *** PRECIO ANTES DE ARRANCAR *** ESCRIBIME POR WHATSAPP ***'));
        var nav = document.querySelector('nav.top');
        if (nav) nav.parentNode.insertBefore(top, nav.nextSibling);
        else best.parentNode.insertBefore(top, best.nextSibling);

        // Las cintas onduladas de la home pasan a ser marquesinas clásicas con el mismo texto
        document.querySelectorAll('.marquee-ribbon[data-marquee-text]').forEach(function (rib) {
            var text = '*** ' + clean(rib.getAttribute('data-marquee-text')).replace(/\s*·\s*/g, ' *** ').toUpperCase();
            if (!/\*\*\*\s*$/.test(text)) text += ' ***';
            var m = addNode(marquee(text + ' ' + text, 'is-gap'));
            rib.parentNode.insertBefore(m, rib.nextSibling);
        });
    }

    // ---------- Secciones como ventanas + barra de tareas ----------
    var tasksBox = null;

    function addTask(section, title) {
        if (!tasksBox || section._retroTask) return;
        var btn = make('button', 'retro-task');
        btn.type = 'button';
        btn.insertAdjacentHTML('beforeend', ICON.win);
        var s = make('span');
        s.textContent = title;
        btn.appendChild(s);
        btn.setAttribute('aria-label', 'Restaurar «' + title + '»');
        btn.addEventListener('click', function () { restore(section); });
        tasksBox.appendChild(btn);
        section._retroTask = btn;
    }

    function restore(section) {
        section.classList.remove('retro-min');
        if (section._retroTask) { section._retroTask.remove(); section._retroTask = null; }
        try { section.scrollIntoView({ block: 'start' }); } catch (e) { section.scrollIntoView(); }
        var first = section.querySelector('.retro-titlebar button');
        if (first) try { first.focus({ preventScroll: true }); } catch (e) {}
    }

    function setupWindows() {
        var sections = document.querySelectorAll('main > section.band, main > section.hero, main > section.page-hero, main > section.note-section, footer');
        sections.forEach(function (sec) {
            var isFooter = sec.tagName === 'FOOTER';
            // Título: el h1 o el título grande de la sección; si no tiene (ej. la lista del FAQ), el de la página
            var heading = sec.querySelector('h1, h2.display, .section-head h2');
            var pageName = clean(document.title.split(/[·|]/)[0]) || 'Mario PC';
            var name = isFooter ? 'Acerca de Mario PC' : (heading ? clean(heading.innerText || heading.textContent) : pageName);
            if (name.length > 48) name = name.slice(0, 46) + '…';
            var title = isFooter ? name : name + ' - Mario PC';
            var bar = addNode(titlebar(title, { buttons: true }));
            sec.insertBefore(bar, sec.firstChild);
            bar.addEventListener('click', function (e) {
                var btn = e.target.closest('button');
                if (!btn) return;
                if (btn.dataset.act === 'max') {
                    var maxed = sec.classList.toggle('retro-max');
                    btn.setAttribute('aria-label', (maxed ? 'Restaurar tamaño de' : 'Maximizar') + ' «' + title + '»');
                } else {
                    sec.classList.add('retro-min');
                    addTask(sec, name);
                }
            });
            cleanups.push(function () {
                sec.classList.remove('retro-min', 'retro-max');
                sec._retroTask = null;
            });
        });

        // Gracias: la caja del medio es una ventana más
        var solo = document.querySelector('main .solo:not(.retro-hide)');
        if (solo) {
            var h = solo.querySelector('h1');
            var bar = addNode(titlebar((h ? clean(h.innerText || h.textContent) : 'Mario PC') + ' - Mario PC'));
            solo.insertBefore(bar, solo.firstChild);
        }
        // 404 clásico
        var ie = document.querySelector('.retro-ie404');
        if (ie) {
            var bar404 = addNode(titlebar('No se puede mostrar la página - Navegador de Internet'));
            ie.insertBefore(bar404, ie.firstChild);
        }
    }

    var music = null;

    function setupTaskbar() {
        var bar = addNode(make('div', 'retro-taskbar'));
        bar.setAttribute('role', 'navigation');
        bar.setAttribute('aria-label', 'Barra de tareas');

        var start = make('button', 'retro-start');
        start.type = 'button';
        start.setAttribute('aria-expanded', 'false');
        start.setAttribute('aria-controls', 'retroStartMenu');
        start.innerHTML = '<img src="/logo.png?v=2" alt="" width="18" height="18">Inicio';
        bar.appendChild(start);

        tasksBox = make('div', 'retro-tasks');
        bar.appendChild(tasksBox);
        cleanups.push(function () { tasksBox = null; });

        var tray = make('div', 'retro-tray');
        var soundBtn = make('button', '', ICON.sound);
        soundBtn.type = 'button';
        soundBtn.setAttribute('aria-pressed', 'false');
        soundBtn.setAttribute('aria-label', 'Poner música');
        soundBtn.title = 'Música';
        var clock = make('span', 'retro-clock');
        tray.appendChild(soundBtn);
        tray.appendChild(clock);
        bar.appendChild(tray);
        document.body.appendChild(bar);

        // Menú Inicio
        var menu = addNode(make('nav', 'retro-startmenu'));
        menu.id = 'retroStartMenu';
        menu.hidden = true;
        menu.setAttribute('aria-label', 'Menú Inicio');
        var items = [
            ['a', ICON.menu.home, '<u>I</u>nicio', '/'],
            ['a', ICON.menu.list, '<u>S</u>ervicios y precios', '/#precios'],
            ['a', ICON.menu.ask, '<u>P</u>reguntas frecuentes', '/faq.html'],
            ['a', ICON.menu.note, '<u>N</u>otas del taller', '/blog.html'],
            ['a', ICON.menu.work, '<u>E</u>mpresas', '/empresas.html'],
            ['a', ICON.menu.pc, 'Estado de mi equipo', '/estado.html'],
            ['sep'],
            ['a', ICON.menu.chat, 'Escribir por <u>W</u>hatsApp', CONFIG.wa, true],
            ['button', ICON.menu.music, '<span data-music-label>Poner música</span>', 'music'],
            ['sep'],
            ['button', ICON.menu.power, '<u>A</u>pagar el equipo...', 'off']
        ];
        var side = make('div', 'retro-startmenu-side', 'Mario<b>PC</b>&nbsp;2002');
        side.setAttribute('aria-hidden', 'true');
        menu.appendChild(side);
        var ul = make('ul');
        items.forEach(function (it) {
            var li = make('li');
            if (it[0] === 'sep') { li.className = 'sep'; li.setAttribute('aria-hidden', 'true'); ul.appendChild(li); return; }
            var n = make(it[0], '', it[1] + '<span>' + it[2] + '</span>');
            if (it[0] === 'a') {
                n.href = it[3];
                if (it[4]) { n.target = '_blank'; n.rel = 'noopener noreferrer'; }
            } else {
                n.type = 'button';
                n.dataset.act = it[3];
            }
            li.appendChild(n);
            ul.appendChild(li);
        });
        menu.appendChild(ul);
        document.body.appendChild(menu);
        var musicLabel = menu.querySelector('[data-music-label]');

        function setMenu(open, focusStart) {
            startMenuOpen = open;
            menu.hidden = !open;
            start.setAttribute('aria-expanded', String(open));
            if (open) {
                var first = menu.querySelector('a, button');
                if (first) try { first.focus({ preventScroll: true }); } catch (e) {}
            } else if (focusStart) {
                try { start.focus({ preventScroll: true }); } catch (e) {}
            }
        }
        start.addEventListener('click', function () { setMenu(menu.hidden); });
        listen(document, 'click', function (e) {
            if (!menu.hidden && !menu.contains(e.target) && !start.contains(e.target)) setMenu(false);
        });
        listen(document, 'keydown', function (e) {
            if (e.key === 'Escape' && !menu.hidden) setMenu(false, true);
        });
        menu.addEventListener('click', function (e) {
            var b = e.target.closest('button, a');
            if (!b) return;
            if (b.dataset.act === 'music') { toggleMusic(); return; }
            setMenu(false);
            if (b.dataset.act === 'off' && window.MPCRetroToggle) window.MPCRetroToggle.disable(true);
        });
        cleanups.push(function () { startMenuOpen = false; });

        // Música
        function paintMusic() {
            var on = !!(music && music.playing);
            soundBtn.setAttribute('aria-pressed', String(on));
            soundBtn.setAttribute('aria-label', on ? 'Parar la música' : 'Poner música');
            if (musicLabel) musicLabel.textContent = on ? 'Parar la música' : 'Poner música';
        }
        function toggleMusic() {
            if (music && music.playing) music.stop(); else startMusic();
            paintMusic();
        }
        soundBtn.addEventListener('click', toggleMusic);
        listen(document, 'visibilitychange', function () {
            if (document.hidden && music && music.playing) { music.stop(); paintMusic(); }
        });
        cleanups.push(function () { if (music) music.stop(); });

        // Reloj: la hora real de Argentina, pero en 2002
        var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        function tick() {
            var p = {};
            try {
                new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Argentina/Buenos_Aires', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
                    .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
            } catch (e) {
                var d = new Date();
                p = { day: d.getDate(), month: d.getMonth() + 1, hour: String(d.getHours()).padStart(2, '0'), minute: String(d.getMinutes()).padStart(2, '0') };
            }
            var day = +p.day, month = +p.month;
            var weekday = new Date(Date.UTC(2002, month - 1, day)).getUTCDay();
            clock.textContent = p.hour + ':' + p.minute;
            clock.title = DIAS[weekday] + ', ' + day + ' de ' + MESES[month - 1] + ' de 2002';
        }
        tick();
        every(tick, 15000);
    }

    // ---------- WhatsApp como ventana de chat ----------
    function setupChat() {
        var float = document.querySelector('.whatsapp-float');
        if (!float) return;
        var box = addNode(make('span', 'msn'));
        box.setAttribute('aria-hidden', 'true');
        box.innerHTML =
            '<span class="msn-bar">' + ICON.chat + 'Mario PC - Conversación</span>' +
            '<span class="msn-who"><span class="msn-dot"></span><b>Mario PC</b> <span class="msn-state"></span></span>' +
            '<span class="msn-say"></span>' +
            '<span class="msn-input">Escribí un mensaje...<span class="msn-send">Enviar</span></span>';
        float.appendChild(box);
        var state = box.querySelector('.msn-state');
        var say = box.querySelector('.msn-say');

        function setSay(text) {
            say.textContent = '';
            var b = make('b');
            b.textContent = 'Mario PC dice: ';
            say.appendChild(b);
            say.appendChild(document.createTextNode(text));
        }
        function sync() {
            var closed = float.classList.contains('is-closed');
            state.textContent = closed ? '(Ausente)' : '(Conectado)';
            if (closed) {
                var note = float.querySelector('.wa-closed-note > span:last-child');
                setSay('Ahora estoy cerrado. ' + clean(note ? note.textContent : 'Escribime y te respondo apenas abra.'));
            } else if (!box._buzzed) {
                setSay('¿Qué le pasa a tu compu? Contame y te paso el precio.');
            }
        }
        sync();
        // Sigue el estado de horario.js (clase is-closed y texto del aviso), ignorando los cambios de la ventanita
        var obs = new MutationObserver(function (list) {
            for (var k = 0; k < list.length; k++) {
                if (!box.contains(list[k].target)) { sync(); return; }
            }
        });
        obs.observe(float, { attributes: true, attributeFilter: ['class'], subtree: true, characterData: true, childList: true });
        cleanups.push(function () { obs.disconnect(); float.classList.remove('msn-buzz'); });

        // Zumbido: una vez por visita, solo si estoy atendiendo
        if (ssGet('mpc-zumbido') === '1') return;
        var seen = 0;
        var id = every(function () {
            if (document.hidden || somethingOpen()) return;
            seen += 1;
            if (seen < CONFIG.zumbidoSeg) return;
            clearInterval(id);
            if (float.classList.contains('is-closed')) return;
            ssSet('mpc-zumbido', '1');
            box._buzzed = true;
            obs.disconnect();
            setSay('te mandó un zumbido. ¿Te doy una mano con la compu?');
            say.firstChild.textContent = 'Mario PC ';
            obs.observe(float, { attributes: true, attributeFilter: ['class'] });
            if (!reduceMotion) {
                float.classList.add('msn-buzz');
                later(function () { float.classList.remove('msn-buzz'); }, 700);
            }
        }, 1000);
    }

    // ---------- Pie: contador y botoncitos ----------
    function setupFooter() {
        var target = document.querySelector('footer .wrap') || document.querySelector('main .solo:not(.retro-hide)');
        if (!target) return;
        var extra = addNode(make('div', 'retro-foot-extra'));
        if (CONFIG.reparados > 0) {
            var c = make('div', 'retro-counter');
            var label = make('span');
            label.textContent = 'Equipos reparados:';
            var digits = make('span', 'retro-counter-digits');
            String(CONFIG.reparados).padStart(6, '0').split('').forEach(function (d) {
                var s = make('span');
                s.textContent = d;
                digits.appendChild(s);
            });
            c.appendChild(label);
            c.appendChild(digits);
            extra.appendChild(c);
        }
        var badges = make('div', 'retro-badges',
            '<span class="retro-badge b1">Hecho a mano<br>con Bloc de Notas</span>' +
            '<span class="retro-badge b2">800 x 600</span>' +
            '<span class="retro-badge b3">100% libre<br>de virus</span>' +
            '<span class="retro-badge b4">Sin Flash</span>' +
            '<span class="retro-badge b5"><span>En construcción</span></span>');
        badges.setAttribute('aria-hidden', 'true');
        extra.appendChild(badges);
        var mod = new Date(document.lastModified);
        if (!isNaN(mod)) {
            var upd = make('span');
            upd.textContent = 'Última actualización: ' + String(mod.getDate()).padStart(2, '0') + '/' + String(mod.getMonth() + 1).padStart(2, '0') + '/2002';
            extra.appendChild(upd);
        }
        target.appendChild(extra);
    }

    // ---------- Blog como fotolog ----------
    function setupFotolog() {
        var grid = document.getElementById('blogPostsGrid');
        if (!grid) return;
        var head = addNode(make('div', 'retro-fotolog-head'));
        grid.parentNode.insertBefore(head, grid);

        function decorate() {
            var cards = grid.querySelectorAll('article.note-card');
            head.hidden = !cards.length;
            head.innerHTML = '';
            var b = make('b');
            b.textContent = 'mariopc';
            head.appendChild(b);
            head.appendChild(document.createTextNode('Fotolog del taller · Fotos: ' + cards.length));
            cards.forEach(function (card) {
                if (card.querySelector('.retro-firmas')) return;
                var t = card.querySelector('.note-card-title');
                var title = clean(t ? t.textContent : '');
                var f = make('div', 'retro-firmas');
                var a = make('a');
                a.href = CONFIG.wa + '?text=' + encodeURIComponent('Hola Mario, vi la nota "' + title + '" en tu fotolog y te quería consultar algo.');
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.textContent = 'Firmá mi fotolog';
                f.appendChild(a);
                f.appendChild(document.createTextNode(' · Las firmas me llegan por WhatsApp'));
                card.appendChild(f);
            });
        }
        decorate();
        var obs = new MutationObserver(function () { obs.disconnect(); decorate(); obs.observe(grid, { childList: true }); });
        obs.observe(grid, { childList: true });
        cleanups.push(function () {
            obs.disconnect();
            grid.querySelectorAll('.retro-firmas').forEach(function (n) { n.remove(); });
        });
    }

    // ---------- Estado del equipo como pantalla de DOS ----------
    function setupDos() {
        var box = document.querySelector('.estado');
        if (!box) return;
        var top = addNode(make('p', 'retro-dos-line'));
        top.appendChild(document.createTextNode('MARIO PC DOS versión 2.02\n(C) Copyright Mario PC 2002.\n\n'));
        var cmd = make('b');
        cmd.textContent = 'C:\\MARIOPC> ESTADO.EXE';
        top.appendChild(cmd);
        box.insertBefore(top, box.firstChild);

        var exitLine = addNode(make('p', 'retro-dos-line'));
        exitLine.textContent = 'Escribí SALIR (o tocá el botón) para volver al 2026.';
        var exit = addNode(make('button', 'retro-dos-exit'));
        exit.type = 'button';
        exit.textContent = 'C:\\MARIOPC> SALIR';
        box.appendChild(exitLine);
        box.appendChild(exit);
        exit.addEventListener('click', function () { if (window.MPCRetroToggle) window.MPCRetroToggle.disable(true); });

        var typed = '';
        listen(document, 'keydown', function (e) {
            var a = document.activeElement;
            if (a && /^(INPUT|TEXTAREA)$/.test(a.tagName)) return;
            if (!e.key || e.key.length !== 1) return;
            typed = (typed + e.key.toUpperCase()).slice(-5);
            if (typed === 'SALIR' && window.MPCRetroToggle) window.MPCRetroToggle.disable(true);
        });
    }

    // ---------- Fotos que bajan como con módem ----------
    function setup56k() {
        if (reduceMotion || !('IntersectionObserver' in window)) return;
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                io.unobserve(en.target);
                if (en.boundingClientRect.width >= 80) en.target.classList.add('retro-56k');
            });
        }, { threshold: 0.15 });
        document.querySelectorAll('main img').forEach(function (img) { io.observe(img); });
        cleanups.push(function () {
            io.disconnect();
            document.querySelectorAll('img.retro-56k').forEach(function (img) { img.classList.remove('retro-56k'); });
        });
    }

    // ---------- Estela de estrellitas ----------
    function setupTrail() {
        if (reduceMotion || !finePointer) return;
        var colors = ['#ffff00', '#ffffff', '#66ccff', '#ff99cc'];
        var last = 0, alive = 0, n = 0;
        listen(document, 'pointermove', function (e) {
            if (e.pointerType && e.pointerType !== 'mouse') return;
            var now = Date.now();
            if (now - last < 40 || alive > 16) return;
            last = now;
            var s = make('span', 'retro-spark');
            s.style.left = (e.clientX - 4) + 'px';
            s.style.top = (e.clientY - 4) + 'px';
            s.style.background = colors[n++ % colors.length];
            alive += 1;
            document.body.appendChild(s);
            setTimeout(function () { s.remove(); alive -= 1; }, 750);
        }, { passive: true });
        cleanups.push(function () { document.querySelectorAll('.retro-spark').forEach(function (s) { s.remove(); }); });
    }

    // ---------- Protector de pantalla: el logo rebotando ----------
    function setupSaver() {
        if (reduceMotion || !finePointer) return;
        var lastActive = Date.now();
        var saver = null, raf = 0;
        var colors = ['#ffff00', '#00ff00', '#66ccff', '#ff99cc', '#ff8c00', '#ffffff'];

        function wake() {
            lastActive = Date.now();
            if (!saver) return;
            cancelAnimationFrame(raf);
            saver.remove();
            saver = null;
        }
        ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach(function (t) {
            listen(window, t, wake, { passive: true, capture: true });
        });
        cleanups.push(function () { cancelAnimationFrame(raf); if (saver) saver.remove(); saver = null; });

        function show() {
            saver = make('div', 'retro-saver');
            saver.setAttribute('aria-hidden', 'true');
            var logo = make('div', 'retro-saver-logo', '<img src="/logo.png?v=2" alt=""><span>Mario PC</span>');
            saver.appendChild(logo);
            document.body.appendChild(saver);
            var x = Math.random() * 200, y = Math.random() * 200, dx = 1.6, dy = 1.3, c = 0;
            logo.style.color = colors[0];
            function step() {
                if (!saver) return;
                var w = saver.clientWidth - logo.offsetWidth, h = saver.clientHeight - logo.offsetHeight;
                x += dx; y += dy;
                var hit = false;
                if (x <= 0 || x >= w) { dx = -dx; x = Math.max(0, Math.min(x, w)); hit = true; }
                if (y <= 0 || y >= h) { dy = -dy; y = Math.max(0, Math.min(y, h)); hit = true; }
                if (hit) logo.style.color = colors[++c % colors.length];
                logo.style.transform = 'translate(' + x + 'px,' + y + 'px)';
                raf = requestAnimationFrame(step);
            }
            raf = requestAnimationFrame(step);
        }
        every(function () {
            if (saver || document.hidden || somethingOpen()) return;
            if (Date.now() - lastActive >= CONFIG.protectorSeg * 1000) show();
        }, 3000);
    }

    // ---------- Audio: módem y apagado (archivos) y música chiptune (sintetizada) ----------
    // retro.js crea el contexto de audio en el mismo clic del botón (Safari lo exige); si no, se crea acá
    var audioCtx = window.MPCRetroAudio || null;
    function audio() {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        if (!audioCtx) audioCtx = window.MPCRetroAudio = new AC();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }
    function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }

    // Melodía original en La menor (Am, F, C, G), 8 compases en corcheas. 0 = silencio.
    var LEAD = [
        76, 81, 79, 76, 74, 76, 72, 69,
        72, 77, 76, 72, 69, 72, 77, 76,
        79, 76, 72, 76, 79, 81, 79, 76,
        74, 71, 67, 71, 74, 0, 74, 76,
        81, 79, 76, 81, 79, 76, 74, 72,
        69, 72, 77, 81, 79, 77, 76, 72,
        76, 79, 84, 79, 76, 79, 81, 79,
        74, 76, 74, 71, 67, 71, 74, 0
    ];
    var ROOTS = [45, 41, 48, 43, 45, 41, 48, 43];

    function startMusic() {
        var c = audio();
        if (!c) return;
        if (music && music.playing) return;
        var master = c.createGain();
        master.gain.value = CONFIG.volumenMusica;
        master.connect(c.destination);
        var eighth = 60 / 132 / 2;
        var i = 0;
        var next = c.currentTime + 0.08;
        function note(type, freq, t, len, vol) {
            var o = c.createOscillator(), g = c.createGain();
            o.type = type;
            o.frequency.value = freq;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(vol, t + 0.006);
            g.gain.exponentialRampToValueAtTime(vol * 0.5, t + len * 0.6);
            g.gain.exponentialRampToValueAtTime(0.0001, t + len);
            o.connect(g).connect(master);
            o.start(t);
            o.stop(t + len + 0.02);
        }
        var timer = setInterval(function () {
            while (next < c.currentTime + 0.15) {
                var step = i % LEAD.length;
                var root = ROOTS[Math.floor(step / 8)];
                if (LEAD[step]) note('square', midi(LEAD[step]), next, eighth * 0.9, 0.5);
                note('triangle', midi(step % 2 ? root + 12 : root), next, eighth * 0.8, 0.9);
                next += eighth;
                i += 1;
            }
        }, 30);
        music = {
            playing: true,
            stop: function () {
                if (!this.playing) return;
                this.playing = false;
                clearInterval(timer);
                var t = c.currentTime;
                master.gain.setValueAtTime(master.gain.value, t);
                master.gain.linearRampToValueAtTime(0, t + 0.08);
                setTimeout(function () { master.disconnect(); }, 200);
            }
        };
    }

    // Archivos de sonido: se bajan una vez y quedan decodificados
    var sounds = {};
    var apagadoData = null;
    function loadSound(url, data) {
        if (sounds[url]) return sounds[url];
        var c = audio();
        if (!c) return Promise.resolve(null);
        sounds[url] = (data || fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }))
            .then(function (buf) {
                if (!buf) return null;
                return new Promise(function (resolve) {
                    c.decodeAudioData(buf.slice(0), resolve, function () { resolve(null); });
                });
            })
            .catch(function () { return null; });
        return sounds[url];
    }
    function playSound(buffer, volume) {
        var c = audio();
        if (!c || !buffer) return;
        var src = c.createBufferSource(), g = c.createGain();
        src.buffer = buffer;
        g.gain.value = volume;
        src.connect(g).connect(c.destination);
        src.start();
    }

    // Ventanita "Conexión de acceso telefónico" que acompaña al sonido
    function connect() {
        if (!started) return;
        var withSound = !reduceMotion && ssGet('mpc-modem') !== '1';
        var box = addNode(make('div', 'retro-dialup'));
        box.setAttribute('role', 'status');
        box.appendChild(titlebar('Conectando a Mario PC'));
        var body = make('div', 'retro-dialup-body', ICON.modem);
        var text = make('span');
        body.appendChild(text);
        box.appendChild(body);
        var barWrap = make('div', 'retro-dialup-bar');
        var bar = make('span');
        barWrap.appendChild(bar);
        box.appendChild(barWrap);
        document.body.appendChild(box);

        // Los pasos de la ventanita siguen al sonido: marca, negocia y conecta cuando termina
        function run(len) {
            var steps = len
                ? [[0, 'Marcando...', 15], [len * 0.35, 'Verificando nombre de usuario y contraseña...', 55], [len, 'Conectado a 56.000 bps', 100]]
                : [[0, 'Conectado a 56.000 bps', 100]];
            steps.forEach(function (st) {
                later(function () { text.textContent = st[1]; bar.style.width = st[2] + '%'; }, st[0]);
            });
            later(function () { box.remove(); }, steps[steps.length - 1][0] + 1800);
        }
        if (!withSound) { run(0); return; }
        ssSet('mpc-modem', '1');
        text.textContent = 'Marcando...';
        bar.style.width = '5%';
        var done = false;
        loadSound(CONFIG.sonidoModem, window.MPCRetroModem).then(function (buffer) {
            if (done || !started) return;
            done = true;
            if (!buffer) { run(0); return; }
            playSound(buffer, CONFIG.volumenModem);
            run(buffer.duration * 1000);
        });
        // Si el sonido tarda en bajar, conecta igual en silencio
        later(function () { if (!done) { done = true; run(0); } }, 2500);
    }

    // "Ya podés apagar tu equipo con seguridad", y vuelta al 2026
    function shutdown(done) {
        var off = make('div', 'retro-off');
        off.setAttribute('role', 'status');
        off.innerHTML = '<div>Ya podés apagar tu equipo con seguridad.<small>Volviendo al 2026...</small></div>';
        document.body.appendChild(off);
        // El archivo del apagado se bajó cuando arrancó el modo; si no llegó, se apaga en silencio.
        // audio() va acá, dentro del clic, para que Safari deje sonar.
        var wait = reduceMotion ? 900 : 1700;
        if (!reduceMotion && apagadoData && audio()) {
            loadSound(CONFIG.sonidoApagado, Promise.resolve(apagadoData)).then(function (b) { playSound(b, CONFIG.volumenApagado); });
            wait = 3100;
        }
        setTimeout(function () {
            done();
            off.remove();
            var toast = make('div', 'theme-toast');
            toast.setAttribute('role', 'status');
            toast.textContent = 'Bienvenido de vuelta al 2026';
            document.body.appendChild(toast);
            requestAnimationFrame(function () { toast.classList.add('is-on'); });
            setTimeout(function () { toast.classList.remove('is-on'); setTimeout(function () { toast.remove(); }, 400); }, 2400);
        }, wait);
    }

    // ---------- Arranque y apagado ----------
    function start() {
        if (started) return;
        started = true;
        setupThemeColor();
        // Deja listo el sonido de apagado (solo baja el archivo: no crea el audio hasta el primer clic)
        if (!reduceMotion) fetch(CONFIG.sonidoApagado).then(function (r) { return r.ok ? r.arrayBuffer() : null; })
            .then(function (buf) { apagadoData = buf; }).catch(function () {});
        if (document.querySelector('.estado')) { setupDos(); return; }
        setupBanners();
        setupWindows();
        setupTaskbar();
        setupChat();
        setupFooter();
        setupFotolog();
        setup56k();
        setupTrail();
        setupSaver();
    }

    function stop() {
        if (!started) return;
        started = false;
        while (cleanups.length) {
            try { cleanups.pop()(); } catch (e) {}
        }
    }

    window.MPCRetro = { start: start, stop: stop, connect: connect, shutdown: shutdown };
})();
