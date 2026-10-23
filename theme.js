// Mario PC — switch de modo claro/oscuro (compartido por todas las páginas)
(function () {
    var root = document.documentElement;
    var KEY = 'mpc-theme';
    var SOUND_URL = '/flashbang.mp3';
    var VOLUME = 0.3;
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
            var icon = btn.querySelector('i');
            if (icon) icon.className = 'ph ' + (light ? 'ph-moon' : 'ph-sun');
            var use = btn.querySelector('use');
            if (use) use.setAttribute('href', light ? '#i-moon' : '#i-sun');
        });
    }

    // ─── Audio ───
    var ctx = null;
    var soundData = null;
    var soundBuffer = null;

    function audio() {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        if (!ctx) ctx = new AC();
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    function prefetch() {
        if (soundData || reduceMotion) return soundData;
        soundData = fetch(SOUND_URL)
            .then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
            .catch(function () { soundData = null; return null; });
        return soundData;
    }

    function getBuffer(c) {
        if (soundBuffer) return Promise.resolve(soundBuffer);
        return (prefetch() || Promise.resolve(null)).then(function (data) {
            if (!data || !c) return null;
            return new Promise(function (resolve) {
                c.decodeAudioData(data.slice(0), function (b) { soundBuffer = b; resolve(b); }, function () { resolve(null); });
            });
        });
    }

    function play(c, buffer) {
        if (!c || !buffer) return;
        var src = c.createBufferSource();
        var gain = c.createGain();
        gain.gain.value = VOLUME;
        src.buffer = buffer;
        src.connect(gain).connect(c.destination);
        src.start();
    }

    function relief(c) {
        if (!c) return;
        var t = c.currentTime;
        var out = c.createGain();
        out.gain.value = VOLUME;
        out.connect(c.destination);

        var len = Math.floor(c.sampleRate);
        var buf = c.createBuffer(1, len, c.sampleRate);
        var data = buf.getChannelData(0);
        for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        var noise = c.createBufferSource();
        noise.buffer = buf;
        var band = c.createBiquadFilter();
        band.type = 'bandpass';
        band.Q.value = 1.2;
        band.frequency.setValueAtTime(1600, t);
        band.frequency.exponentialRampToValueAtTime(250, t + 0.9);
        var ng = c.createGain();
        ng.gain.setValueAtTime(0, t);
        ng.gain.linearRampToValueAtTime(0.35, t + 0.15);
        ng.gain.exponentialRampToValueAtTime(0.001, t + 0.95);
        noise.connect(band).connect(ng).connect(out);
        noise.start(t);

        [[523.25, 0.35], [783.99, 0.5]].forEach(function (n) {
            var o = c.createOscillator();
            var g = c.createGain();
            o.type = 'sine';
            o.frequency.value = n[0];
            g.gain.setValueAtTime(0, t + n[1]);
            g.gain.linearRampToValueAtTime(0.14, t + n[1] + 0.06);
            g.gain.exponentialRampToValueAtTime(0.001, t + n[1] + 1.1);
            o.connect(g).connect(out);
            o.start(t + n[1]);
            o.stop(t + n[1] + 1.2);
        });
    }

    // ─── Efectos visuales ───
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

    // ─── Cambio de tema ───
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
                play(c, buffer);
                flash(function () { paint('light'); });
                setTimeout(function () { toast('Ojo con el brillo'); }, 1300);
            };
            getBuffer(c).then(go);
            setTimeout(function () { go(soundBuffer); }, 700);
            return;
        }

        if (next === 'dark' && flashed && !relieved && !reduceMotion) {
            write('sessionStorage', 'mpc-relief', '1');
            relief(audio());
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
