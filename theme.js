// Mario PC: switch de modo claro/oscuro (compartido por todas las páginas)
(function () {
    var root = document.documentElement;
    var KEY = 'mpc-theme';
    // Sonidos: al pasar a claro y al volver a oscuro. Los volúmenes están nivelados para que
    // suenen parecido entre sí y con el miau de Pelusa (ver README, "Modo claro").
    var SOUNDS = {
        flash: { url: '/flashbang.mp3', volume: 0.16 },
        relief: { url: '/yoooo.mp3', volume: 0.4 }
    };
    var COLORS = { dark: '#07090a', light: '#f4f6f5' };

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var toggles = document.querySelectorAll('.theme-toggle');
    if (!toggles.length) return;

    function read(store, key) {
        try { return window[store].getItem(key); } catch (e) { return null; }
    }
    function write(store, key, value) {
        try { window[store].setItem(key, value); } catch (e) {}
    }

    function current() {
        return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    }

    function paint(theme) {
        if (theme === 'light') root.setAttribute('data-theme', 'light');
        else root.removeAttribute('data-theme');

        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', COLORS[theme]);

        toggles.forEach(function (btn) {
            var light = theme === 'light';
            btn.setAttribute('aria-pressed', String(light));
            btn.setAttribute('aria-label', light ? 'Volver al modo oscuro' : 'Activar modo claro');
            btn.setAttribute('title', light ? 'Modo oscuro' : 'Modo claro');
            var use = btn.querySelector('use');
            if (use) use.setAttribute('href', light ? '#i-moon' : '#i-sun');
        });
    }

    // Audio
    var ctx = null;

    function audio() {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        if (!ctx) ctx = new AC();
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    function prefetch() {
        if (reduceMotion) return;
        Object.keys(SOUNDS).forEach(function (name) {
            var s = SOUNDS[name];
            if (s.data) return;
            s.data = fetch(s.url)
                .then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
                .catch(function () { s.data = null; return null; });
        });
    }

    function getBuffer(c, name) {
        var s = SOUNDS[name];
        if (s.buffer) return Promise.resolve(s.buffer);
        prefetch();
        return (s.data || Promise.resolve(null)).then(function (data) {
            if (!data || !c) return null;
            return new Promise(function (resolve) {
                c.decodeAudioData(data.slice(0), function (b) { s.buffer = b; resolve(b); }, function () { resolve(null); });
            });
        });
    }

    function play(c, buffer, volume) {
        if (!c || !buffer) return;
        var src = c.createBufferSource();
        var gain = c.createGain();
        gain.gain.value = volume;
        src.buffer = buffer;
        src.connect(gain).connect(c.destination);
        src.start();
    }

    // Efectos visuales
    var toastEl = null;
    var toastTimer = null;

    function toast(text) {
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.className = 'theme-toast';
            toastEl.setAttribute('role', 'status');
            document.body.appendChild(toastEl);
        }
        clearTimeout(toastTimer);
        toastEl.textContent = text;
        toastEl.classList.add('is-on');
        toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2800);
    }

    function flash(then) {
        var el = document.createElement('div');
        el.className = 'theme-flash';
        document.body.appendChild(el);
        el.style.opacity = '1';
        root.classList.add('theme-instant');
        then();
        requestAnimationFrame(function () {
            root.classList.remove('theme-instant');
            setTimeout(function () {
                el.style.transition = 'opacity 1.8s ease-out';
                el.style.opacity = '0';
                setTimeout(function () { el.remove(); }, 1900);
            }, 140);
        });
    }

    function instant(theme) {
        root.classList.add('theme-instant');
        paint(theme);
        requestAnimationFrame(function () { root.classList.remove('theme-instant'); });
    }

    // Cambio de tema
    function toggle() {
        var next = current() === 'light' ? 'dark' : 'light';
        write('localStorage', KEY, next);

        if (typeof window.gtag === 'function') {
            window.gtag('event', 'theme_toggle', { theme: next });
        }

        var flashed = read('sessionStorage', 'mpc-flash') === '1';
        var relieved = read('sessionStorage', 'mpc-relief') === '1';

        if (next === 'light' && !flashed && !reduceMotion) {
            write('sessionStorage', 'mpc-flash', '1');
            var c = audio();
            var go = function (buffer) {
                if (go.done) return;
                go.done = true;
                play(c, buffer, SOUNDS.flash.volume);
                flash(function () { paint('light'); });
                setTimeout(function () { toast('Ojo con el brillo'); }, 1300);
            };
            getBuffer(c, 'flash').then(go);
            setTimeout(function () { go(SOUNDS.flash.buffer); }, 700);
            return;
        }

        if (next === 'dark' && flashed && !relieved && !reduceMotion) {
            write('sessionStorage', 'mpc-relief', '1');
            var rc = audio();
            getBuffer(rc, 'relief').then(function (b) { play(rc, b, SOUNDS.relief.volume); });
            instant('dark');
            setTimeout(function () { toast('Ahh, mucho mejor.'); }, 500);
            return;
        }

        instant(next);
    }

    paint(current());
    toggles.forEach(function (btn) {
        btn.addEventListener('click', toggle);
        btn.addEventListener('pointerenter', prefetch, { once: true });
        btn.addEventListener('focus', prefetch, { once: true });
        btn.addEventListener('touchstart', prefetch, { once: true, passive: true });
    });
})();
