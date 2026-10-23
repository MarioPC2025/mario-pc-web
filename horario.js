/* ─── HORARIO DINÁMICO (mariopc.com.ar) ───
   Lo usan index, empresas, faq y blog.
   - index: cartel abierto/cerrado (hero y sección ubicación) y resaltado de "hoy" en la tabla.
   - Todas: cuando el local está cerrado, el botón flotante de WhatsApp muestra unas "Z" (durmiendo),
     un aviso al pasar el mouse (compu) y un aviso con "Escribir igual" al tocarlo (celular).
   Horario de atención y reglas: ver scheduleFor() más abajo.
   Cierres manuales y feriados: se leen de status.json (ver README). */
// Horario: Lunes a jueves 10-17, Viernes 10-15, Sábado y domingo cerrado.
// Se calcula siempre en hora de Argentina, sin importar dónde esté el visitante.
// status.json permite cerrar manualmente (por días o por horas, siempre con vencimiento) y listar feriados.
// Si status.json no carga o tiene errores, se usa solo el horario normal.
(function () {
    const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    let config = null; // se completa desde status.json; null = solo horario normal

    function pad(n) {
        return String(n).padStart(2, '0');
    }

    function getArgentinaTime() {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Argentina/Buenos_Aires',
            year: 'numeric', month: '2-digit', day: '2-digit',
            weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
        }).formatToParts(new Date());
        const map = {};
        parts.forEach(p => map[p.type] = p.value);
        const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
        let hour = parseInt(map.hour, 10);
        if (hour === 24) hour = 0;
        return {
            date: `${map.year}-${map.month}-${map.day}`,
            day: weekdayMap[map.weekday],
            hour,
            minute: parseInt(map.minute, 10)
        };
    }

    // ── Helpers de fechas (formato AAAA-MM-DD) ──
    function dayOfWeek(dateStr) {
        return new Date(dateStr + 'T12:00:00Z').getUTCDay();
    }
    function addDays(dateStr, n) {
        const d = new Date(dateStr + 'T12:00:00Z');
        d.setUTCDate(d.getUTCDate() + n);
        return d.toISOString().slice(0, 10);
    }
    function diffDays(a, b) {
        return Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 86400000);
    }
    function isValidDate(s) {
        if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
        const d = new Date(s + 'T12:00:00Z');
        return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
    }

    // "hasta" puede ser un día ("2026-10-06": cerrado todo ese día)
    // o un día con hora ("2026-10-06 14:00": vuelvo a esa hora). Hora de Argentina.
    function parseHasta(s) {
        if (typeof s !== 'string') return null;
        const m = s.trim().match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{1,2}):(\d{2}))?$/);
        if (!m || !isValidDate(m[1])) return null;
        if (m[2] === undefined) {
            return { date: m[1], hasTime: false, hour: 0, minute: 0, end: addDays(m[1], 1) + 'T00:00' };
        }
        const hour = parseInt(m[2], 10), minute = parseInt(m[3], 10);
        if (hour > 23 || minute > 59) return null;
        return { date: m[1], hasTime: true, hour, minute, end: `${m[1]}T${pad(hour)}:${pad(minute)}` };
    }

    function scheduleFor(day) {
        if (day >= 1 && day <= 4) return { open: 10 * 60, close: 17 * 60 };
        if (day === 5) return { open: 10 * 60, close: 15 * 60 };
        return null; // sábado/domingo cerrado
    }

    function isHoliday(dateStr) {
        return !!config && config.feriados.includes(dateStr);
    }

    function scheduleForDate(dateStr) {
        if (isHoliday(dateStr)) return null;
        return scheduleFor(dayOfWeek(dateStr));
    }

    function fmtTime(mins) {
        return `${Math.floor(mins / 60)}:${pad(mins % 60)}`;
    }

    // "hoy", "mañana", "el lunes" o "el lunes 19/10", relativo a todayDate
    function whenLabel(todayDate, d) {
        const gap = diffDays(todayDate, d);
        const name = dayNames[dayOfWeek(d)];
        if (gap === 0) return 'hoy';
        if (gap === 1) return 'mañana';
        if (gap <= 6) return `el ${name}`;
        return `el ${name} ${d.slice(8)}/${d.slice(5, 7)}`;
    }

    // Próximo día con atención, estrictamente después de afterDate.
    function nextOpening(todayDate, afterDate) {
        for (let i = 1; i <= 60; i++) {
            const d = addDays(afterDate, i);
            const sched = scheduleForDate(d);
            if (!sched) continue;
            return `Abro ${whenLabel(todayDate, d)} a las ${fmtTime(sched.open)}`;
        }
        return null;
    }

    // Texto de reapertura cuando el cierre manual termina a una hora puntual
    function reopeningAt(todayDate, h) {
        const sched = scheduleForDate(h.date);
        const mins = h.hour * 60 + h.minute;
        if (sched && mins <= sched.open) {
            return `Abro ${whenLabel(todayDate, h.date)} a las ${fmtTime(sched.open)}`;
        }
        if (sched && mins < sched.close) {
            return `Vuelvo ${whenLabel(todayDate, h.date)} a las ${fmtTime(mins)}`;
        }
        return nextOpening(todayDate, h.date);
    }

    // El cierre manual solo vale si tiene "hasta" válido y todavía no llegó ese momento.
    // Sin "hasta", o con "hasta" vencido, se ignora: nunca puede quedar cerrado para siempre.
    function activeOverride(nowStr) {
        if (!config || !config.cerrado || !config.hasta) return null;
        return nowStr < config.hasta.end ? config : null;
    }

    function computeStatus() {
        const { date, day, hour, minute } = getArgentinaTime();
        const minutesNow = hour * 60 + minute;
        const nowStr = `${date}T${pad(hour)}:${pad(minute)}`;

        // 1) Cierre manual desde status.json (por días o por horas)
        const ov = activeOverride(nowStr);
        if (ov) {
            const h = ov.hasta;
            const next = h.hasTime ? reopeningAt(date, h) : nextOpening(date, h.date);
            const label = ov.mensaje || ('Cerrado temporalmente' + (next ? ` · ${next}` : ''));
            return { open: false, label, today: null, when: next };
        }

        // 2) Feriado (solo si cae en un día en que normalmente atiendo)
        if (isHoliday(date) && scheduleFor(day)) {
            const next = nextOpening(date, date);
            return { open: false, label: 'Cerrado por feriado' + (next ? ` · ${next}` : ''), today: null, when: next };
        }

        // 3) Horario normal
        const today = scheduleForDate(date);
        if (today) {
            if (minutesNow < today.open) {
                return { open: false, label: `Cerrado · Abro hoy a las ${fmtTime(today.open)}`, today: day, when: `Abro hoy a las ${fmtTime(today.open)}` };
            }
            if (minutesNow < today.close) {
                return { open: true, label: `Abierto ahora · Cierro a las ${fmtTime(today.close)}`, today: day };
            }
        }

        const next = nextOpening(date, date);
        return { open: false, label: next ? `Cerrado · ${next}` : 'Cerrado', today: day, when: next };
    }

    // ── Botón flotante de WhatsApp cuando el local está cerrado ──
    // - Unas "Z" animadas sobre el botón (está "durmiendo").
    // - En compu: el aviso aparece unos segundos al entrar y después al pasar el mouse.
    // - En celular: al tocar el botón aparece el aviso con "Escribir igual" (no se pierde el contacto).
    const ICONS = {
        moon: '<svg viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M240 96a8 8 0 0 1-8 8h-16v16a8 8 0 0 1-16 0v-16h-16a8 8 0 0 1 0-16h16V72a8 8 0 0 1 16 0v16h16a8 8 0 0 1 8 8m-96-40h8v8a8 8 0 0 0 16 0v-8h8a8 8 0 0 0 0-16h-8v-8a8 8 0 0 0-16 0v8h-8a8 8 0 0 0 0 16m72.77 97a8 8 0 0 1 1.43 8A96 96 0 1 1 95.07 37.8a8 8 0 0 1 10.6 9.06a88.07 88.07 0 0 0 103.47 103.47a8 8 0 0 1 7.63 2.67m-19.39 14.88c-1.79.09-3.59.14-5.38.14A104.11 104.11 0 0 1 88 64c0-1.79 0-3.59.14-5.38a80 80 0 1 0 109.24 109.24Z"/></svg>',
        x: '<svg viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128L50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z"/></svg>',
        wa: '<svg viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="m152.58 145.23l23 11.48A24 24 0 0 1 152 176a72.08 72.08 0 0 1-72-72a24 24 0 0 1 19.29-23.54l11.48 23L101 118a8 8 0 0 0-.73 7.51a56.47 56.47 0 0 0 30.15 30.15A8 8 0 0 0 138 155ZM232 128a104 104 0 0 1-152.88 91.82l-34.05 11.35a16 16 0 0 1-20.24-20.24l11.35-34.05A104 104 0 1 1 232 128m-40 24a8 8 0 0 0-4.42-7.16l-32-16a8 8 0 0 0-8 .5l-14.69 9.8a40.55 40.55 0 0 1-16-16l9.8-14.69a8 8 0 0 0 .5-8l-16-32A8 8 0 0 0 104 64a40 40 0 0 0-40 40a88.1 88.1 0 0 0 88 88a40 40 0 0 0 40-40"/></svg>'
    };

    let floatBtn = null;
    let floatLabel = '';
    let noteText = null;
    let sheet = null;
    let sheetText = null;
    let peeked = false;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

    function setupFloat() {
        floatBtn = document.querySelector('.whatsapp-float');
        if (!floatBtn) return;
        floatLabel = floatBtn.getAttribute('aria-label') || 'Escribir por WhatsApp';

        const style = document.createElement('style');
        style.textContent = `
            .wa-zzz { position: absolute; left: 34px; top: 4px; width: 0; height: 0; pointer-events: none; display: none; }
            .whatsapp-float.is-closed .wa-zzz { display: block; }
            .wa-zzz span { position: absolute; left: 0; bottom: 0; font-family: var(--font-display, Impact, sans-serif);
                font-size: 19px; line-height: 1; color: var(--white, #e8edea); opacity: 0;
                text-shadow: 0 0 6px rgba(var(--bg-rgb, 7, 9, 10), 0.95), 0 0 2px rgba(var(--bg-rgb, 7, 9, 10), 0.95);
                animation: wa-zz 2.7s linear infinite; }
            .wa-zzz span:nth-child(2) { animation-delay: 0.9s; }
            .wa-zzz span:nth-child(3) { animation-delay: 1.8s; }
            @keyframes wa-zz {
                0% { opacity: 0; transform: translate(0, 0) scale(0.5) rotate(-12deg); }
                30% { opacity: 1; }
                65% { opacity: 0.9; }
                100% { opacity: 0; transform: translate(14px, -44px) scale(1.2) rotate(10deg); }
            }

            .wa-closed-note { position: absolute; right: calc(100% + 12px); top: 50%; translate: 6px -50%;
                width: max-content; max-width: min(240px, calc(100vw - 110px)); padding: 10px 13px; border-radius: 4px;
                text-align: left; white-space: normal; pointer-events: none;
                background: rgba(var(--bg-rgb, 7, 9, 10), 0.97);
                box-shadow: 0 0 0 1px rgba(255, 110, 110, 0.28), 0 8px 24px rgba(0, 0, 0, 0.35);
                font-family: var(--font-body, system-ui, sans-serif); font-size: 0.82rem; line-height: 1.4; font-weight: 300;
                color: var(--white, #e8edea); opacity: 0; visibility: hidden;
                transition: opacity 200ms cubic-bezier(0.2, 0, 0, 1), translate 200ms cubic-bezier(0.2, 0, 0, 1), visibility 0s linear 200ms; }
            .wa-closed-note strong { display: block; margin-bottom: 2px; font-weight: 400; font-family: var(--font-mono, monospace);
                font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--red, #ff9a9a); }
            .whatsapp-float.is-closed.wa-peek .wa-closed-note { opacity: 1; visibility: visible; translate: 0 -50%; transition-delay: 0s; }
            @media (hover: hover) and (pointer: fine) {
                .whatsapp-float.is-closed:hover .wa-closed-note,
                .whatsapp-float.is-closed:focus-visible .wa-closed-note { opacity: 1; visibility: visible; translate: 0 -50%; transition-delay: 0s; }
            }
            @media (hover: none), (pointer: coarse) { .wa-closed-note { display: none; } }

            .wa-sheet { position: fixed; z-index: 501; right: calc(20px + env(safe-area-inset-right, 0px));
                bottom: calc(92px + env(safe-area-inset-bottom, 0px)); width: min(320px, calc(100vw - 40px));
                display: grid; gap: 10px; padding: 20px 20px 18px; border-radius: 6px; text-align: left;
                background: var(--bg-alt, #0c0f10); color: var(--white, #e8edea);
                box-shadow: 0 0 0 1px rgba(255, 110, 110, 0.28), 0 20px 50px -10px rgba(0, 0, 0, 0.6);
                font-family: var(--font-body, system-ui, sans-serif); }
            .wa-sheet[hidden] { display: none; }
            .wa-sheet-moon { width: 28px; height: 28px; color: var(--red, #ff9a9a); }
            .wa-sheet-moon svg, .wa-sheet-x svg, .wa-sheet-go svg { width: 100%; height: 100%; display: block; }
            .wa-sheet strong { font-family: var(--font-display, Impact, sans-serif); font-weight: 400; font-size: 1.7rem;
                line-height: 1; letter-spacing: 0.02em; text-transform: uppercase; }
            .wa-sheet p { margin: 0; color: var(--muted, #788480); font-size: 0.95rem; line-height: 1.45; font-weight: 300; }
            .wa-sheet-x { position: absolute; top: 6px; right: 6px; width: 44px; height: 44px; padding: 12px; border: 0;
                border-radius: 3px; background: transparent; color: var(--muted, #788480); cursor: pointer; }
            .wa-sheet-go { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 48px; margin-top: 4px;
                border-radius: 3px; background: var(--green-fill, #1ddd65); color: #030804; text-decoration: none;
                font-family: var(--font-mono, monospace); font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
            .wa-sheet-go span { width: 20px; height: 20px; }
            .wa-sheet-x:focus-visible, .wa-sheet-go:focus-visible { outline: 2px solid var(--green, #1ddd65); outline-offset: 2px; }
            @media (prefers-reduced-motion: reduce) {
                .wa-zzz span { animation: none; }
                .wa-zzz span:nth-child(1) { opacity: 0.45; transform: translate(0, 0) scale(0.65); }
                .wa-zzz span:nth-child(2) { opacity: 0.7; transform: translate(7px, -16px) scale(0.85); }
                .wa-zzz span:nth-child(3) { opacity: 1; transform: translate(14px, -34px) scale(1); }
                .wa-closed-note { transition: none; }
            }
        `;
        document.head.appendChild(style);

        const zzz = document.createElement('span');
        zzz.className = 'wa-zzz';
        zzz.setAttribute('aria-hidden', 'true');
        zzz.innerHTML = '<span>Z</span><span>Z</span><span>Z</span>';
        floatBtn.appendChild(zzz);

        const note = document.createElement('span');
        note.className = 'wa-closed-note';
        note.setAttribute('aria-hidden', 'true');
        const title = document.createElement('strong');
        title.textContent = 'Cerrado ahora';
        noteText = document.createElement('span');
        noteText.textContent = 'Escribime y te respondo apenas abra.';
        note.appendChild(title);
        note.appendChild(noteText);
        floatBtn.appendChild(note);

        sheet = document.createElement('div');
        sheet.className = 'wa-sheet';
        sheet.hidden = true;
        sheet.setAttribute('role', 'dialog');
        sheet.setAttribute('aria-labelledby', 'waSheetTitle');
        sheet.setAttribute('aria-describedby', 'waSheetText');
        sheet.innerHTML =
            '<button type="button" class="wa-sheet-x" aria-label="Cerrar aviso">' + ICONS.x + '</button>' +
            '<span class="wa-sheet-moon">' + ICONS.moon + '</span>' +
            '<strong id="waSheetTitle">Ahora estoy cerrado</strong>' +
            '<p id="waSheetText">Escribime igual y te respondo apenas abra.</p>' +
            '<a class="wa-sheet-go" target="_blank" rel="noopener noreferrer"><span>' + ICONS.wa + '</span>Escribir igual</a>';
        sheet.querySelector('.wa-sheet-go').href = floatBtn.href;
        sheetText = sheet.querySelector('#waSheetText');
        document.body.appendChild(sheet);

        function closeSheet() { sheet.hidden = true; }
        floatBtn.addEventListener('click', (e) => {
            if (!floatBtn.classList.contains('is-closed') || canHover.matches) return;
            e.preventDefault();
            sheet.hidden = !sheet.hidden;
            if (!sheet.hidden) {
                try { sheet.querySelector('.wa-sheet-go').focus({ preventScroll: true }); } catch (err) {}
            }
        });
        sheet.querySelector('.wa-sheet-x').addEventListener('click', closeSheet);
        sheet.querySelector('.wa-sheet-go').addEventListener('click', () => setTimeout(closeSheet, 300));
        document.addEventListener('click', (e) => {
            if (!sheet.hidden && !sheet.contains(e.target) && !floatBtn.contains(e.target)) closeSheet();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !sheet.hidden) { closeSheet(); floatBtn.focus(); }
        });
    }

    function renderFloat(status) {
        if (!floatBtn) return;
        const isOpen = status.open;
        floatBtn.classList.toggle('is-closed', !isOpen);
        floatBtn.setAttribute('aria-label', isOpen ? floatLabel : floatLabel + '. Estoy cerrado ahora, respondo apenas abra');
        const when = status.when ? status.when + '. ' : '';
        if (noteText) noteText.textContent = when + 'Escribime y te respondo apenas abra.';
        if (sheetText) sheetText.textContent = when + 'Escribime igual y te respondo apenas abra.';
        if (isOpen && sheet) sheet.hidden = true;

        // En compu, la primera vez que se ve cerrado el aviso se asoma unos segundos
        if (!isOpen && !peeked && canHover.matches) {
            peeked = true;
            setTimeout(() => floatBtn.classList.add('wa-peek'), 1200);
            setTimeout(() => floatBtn.classList.remove('wa-peek'), 7200);
        }
    }

    function render() {
        const status = computeStatus();
        const badges = [
            { badge: document.getElementById('hoursBadge'), text: document.getElementById('hoursBadgeText') },
            { badge: document.getElementById('hoursBadgeLocation'), text: document.getElementById('hoursBadgeLocationText') }
        ];
        badges.forEach(({ badge, text }) => {
            if (!badge || !text) return;
            text.textContent = status.label;
            badge.classList.toggle('closed', !status.open);
        });

        renderFloat(status);

        document.querySelectorAll('.hours-row').forEach(row => {
            const days = (row.dataset.days || '').split(',').map(Number);
            row.classList.toggle('today', status.today !== null && days.includes(status.today));
        });
    }

    async function loadConfig() {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        try {
            const res = await fetch('status.json?v=' + Math.floor(Date.now() / 60000), {
                cache: 'no-store',
                signal: controller.signal
            });
            if (!res.ok) throw new Error('status.json no disponible');
            const raw = await res.json();
            config = {
                cerrado: raw.cerrado === true || String(raw.cerrado).toLowerCase() === 'true',
                hasta: parseHasta(raw.hasta),
                mensaje: typeof raw.mensaje === 'string' ? raw.mensaje.trim().slice(0, 120) : '',
                feriados: Array.isArray(raw.feriados) ? raw.feriados.filter(isValidDate) : []
            };
        } catch (e) {
            // Cualquier problema (sin conexión, archivo con errores, etc.):
            // se conserva lo último cargado o, si no hay nada, solo el horario normal.
        } finally {
            clearTimeout(timer);
        }
    }

    // El cartel dice "Verificando horario..." hasta que status.json responde (máx. 4 s)
    setupFloat();
    loadConfig().then(render);
    setInterval(render, 60000); // recalcular cada minuto
    setInterval(() => loadConfig().then(render), 5 * 60000); // releer status.json cada 5 minutos
})();
