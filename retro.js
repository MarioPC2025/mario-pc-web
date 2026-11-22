// Mario PC: botón del modo 2002 (el monitor, al lado del sol/luna). Va en todas las páginas.
// Acá solo está el botón y la preferencia guardada. Todo lo demás (barra de tareas, ventanas, MSN,
// música, módem, etc.) está en retro-fx.js, que se baja recién cuando alguien activa el modo.
// El modo se activa también con ?retro=1 en la dirección (y se apaga con ?retro=0). Ver RETRO.md.
(function () {
    var root = document.documentElement;
    var KEY = 'mpc-retro';
    var FX_SRC = '/retro-fx.js?v=1';
    var toggles = document.querySelectorAll('.retro-toggle');

    function write(value) {
        try { localStorage.setItem(KEY, value); } catch (e) {}
    }

    function isOn() { return root.hasAttribute('data-retro'); }

    function paint(on) {
        toggles.forEach(function (btn) {
            btn.setAttribute('aria-pressed', String(on));
            btn.setAttribute('aria-label', on ? 'Volver al 2026' : 'Activar modo 2002');
            btn.setAttribute('title', on ? 'Volver al 2026' : 'Modo 2002');
        });
    }

    // Saca ?retro=1 / ?retro=0 de la dirección para que al recargar mande lo guardado
    function cleanUrl() {
        if (!/[?&]retro=/.test(location.search) || !window.history || !history.replaceState) return;
        var q = location.search.replace(/^\?/, '').split('&').filter(function (p) { return p && p.indexOf('retro=') !== 0; }).join('&');
        try { history.replaceState(history.state, '', location.pathname + (q ? '?' + q : '') + location.hash); } catch (e) {}
    }

    var fxLoading = null;
    function loadFx() {
        if (window.MPCRetro) return Promise.resolve(window.MPCRetro);
        if (!fxLoading) {
            fxLoading = new Promise(function (resolve, reject) {
                var s = document.createElement('script');
                s.src = FX_SRC;
                s.onload = function () { window.MPCRetro ? resolve(window.MPCRetro) : reject(new Error('retro-fx')); };
                s.onerror = function () { fxLoading = null; reject(new Error('retro-fx')); };
                document.head.appendChild(s);
            });
        }
        return fxLoading;
    }

    function track(on) {
        if (typeof window.gtag === 'function') window.gtag('event', 'retro_toggle', { retro: on ? 'on' : 'off' });
    }

    function enable(fromClick) {
        root.setAttribute('data-retro', '');
        write('1');
        paint(true);
        if (fromClick) track(true);
        loadFx().then(function (fx) {
            if (!isOn()) return;
            fx.start();
            if (fromClick) fx.connect();
        }).catch(function () {});
    }

    function disable(fromClick) {
        function done() {
            if (window.MPCRetro) window.MPCRetro.stop();
            root.removeAttribute('data-retro');
            write('0');
            paint(false);
            cleanUrl();
        }
        if (fromClick) track(false);
        if (fromClick && window.MPCRetro) window.MPCRetro.shutdown(done);
        else done();
    }

    // retro-fx.js usa esto para "Apagar el equipo" y el SALIR de la pantalla de DOS
    window.MPCRetroToggle = { enable: enable, disable: disable, isOn: isOn };

    paint(isOn());
    toggles.forEach(function (btn) {
        btn.addEventListener('click', function () { isOn() ? disable(true) : enable(true); });
    });
    if (isOn()) enable(false);
})();
