/* ─── HORARIO DINÁMICO (mariopc.com.ar) ───
   Lo usan index, empresas, faq y blog.
   - index: cartel abierto/cerrado (hero y sección ubicación) y resaltado de "hoy" en la tabla.
   - Todas: aviso "Cerrado ahora" junto al botón flotante de WhatsApp cuando el local está cerrado.
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
            return { open: false, label, today: null };
        }

        // 2) Feriado (solo si cae en un día en que normalmente atiendo)
        if (isHoliday(date) && scheduleFor(day)) {
            const next = nextOpening(date, date);
            return { open: false, label: 'Cerrado por feriado' + (next ? ` · ${next}` : ''), today: null };
        }

        // 3) Horario normal
        const today = scheduleForDate(date);
        if (today) {
            if (minutesNow < today.open) {
                return { open: false, label: `Cerrado · Abro hoy a las ${fmtTime(today.open)}`, today: day };
            }
            if (minutesNow < today.close) {
                return { open: true, label: `Abierto ahora · Cierro a las ${fmtTime(today.close)}`, today: day };
            }
        }

        const next = nextOpening(date, date);
        return { open: false, label: next ? `Cerrado · ${next}` : 'Cerrado', today: day };
    }

    // ── Aviso en el botón flotante de WhatsApp (cuando el local está cerrado) ──
    let floatBtn = null;
    let floatLabel = '';

    function setupFloat() {
        floatBtn = document.querySelector('.whatsapp-float');
        if (!floatBtn) return;
        floatLabel = floatBtn.getAttribute('aria-label') || 'Escribir por WhatsApp';

        const style = document.createElement('style');
        style.textContent = `
            .wa-closed-note { display: none; position: absolute; right: calc(100% + 14px); top: 50%;
                width: max-content; max-width: min(230px, calc(100vw - 190px));
                padding: 9px 13px; border-radius: 2px; text-align: left; white-space: normal;
                background: rgba(7, 9, 10, 0.94); backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 100, 100, 0.25);
                box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35); pointer-events: none; }
            .wa-closed-note::after { content: ''; position: absolute; right: -5px; top: 50%;
                width: 8px; height: 8px; background: rgba(7, 9, 10, 0.98);
                border-top: 1px solid rgba(255, 100, 100, 0.25); border-right: 1px solid rgba(255, 100, 100, 0.25);
                transform: translateY(-50%) rotate(45deg); }
            .wa-closed-note strong { display: block; margin-bottom: 3px; font-weight: 400;
                font-family: var(--font-mono, monospace); font-size: 0.6rem; letter-spacing: 0.1em;
                text-transform: uppercase; color: #ff9a9a; }
            .wa-closed-note span { display: block; font-family: var(--font-body, system-ui, sans-serif);
                font-size: 0.8rem; line-height: 1.35; color: var(--white, #e8edea); }
            .whatsapp-float.is-closed .wa-closed-note { display: block; animation: wa-note-in 0.35s ease both; }
            @keyframes wa-note-in { from { opacity: 0; transform: translate(8px, -50%); } to { opacity: 1; transform: translate(0, -50%); } }
            @media (prefers-reduced-motion: reduce) { .whatsapp-float.is-closed .wa-closed-note { animation: none; transform: translate(0, -50%); } }
        `;
        document.head.appendChild(style);

        const note = document.createElement('span');
        note.className = 'wa-closed-note';
        note.setAttribute('aria-hidden', 'true');
        const title = document.createElement('strong');
        title.textContent = 'Cerrado ahora';
        const text = document.createElement('span');
        text.textContent = 'Escribime y te respondo apenas abra';
        note.appendChild(title);
        note.appendChild(text);
        floatBtn.appendChild(note);
    }

    function renderFloat(isOpen) {
        if (!floatBtn) return;
        floatBtn.classList.toggle('is-closed', !isOpen);
        floatBtn.setAttribute('aria-label', isOpen ? floatLabel : floatLabel + '. Estoy cerrado ahora, respondo apenas abra');
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

        renderFloat(status.open);

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
