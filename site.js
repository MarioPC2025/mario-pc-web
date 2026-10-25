// Mario PC: menú, volver arriba, frases del pie y medición de clics a WhatsApp (todas las páginas con menú)
(function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var hamburger = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobileMenu');
    if (hamburger && mobileMenu) {
        var setMobile = function (open) {
            mobileMenu.classList.toggle('open', open);
            hamburger.setAttribute('aria-expanded', String(open));
            hamburger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
            var use = hamburger.querySelector('use');
            if (use) use.setAttribute('href', open ? '#i-x' : '#i-list');
            var icon = hamburger.querySelector('i');
            if (icon) icon.className = 'ph ' + (open ? 'ph-x' : 'ph-list');
        };
        hamburger.addEventListener('click', function () { setMobile(!mobileMenu.classList.contains('open')); });
        mobileMenu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMobile(false); }); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('open')) { setMobile(false); hamburger.focus(); }
        });
    }

    var navEl = document.querySelector('nav.top');
    var backToTop = document.getElementById('backToTop');
    function onScroll() {
        if (navEl) navEl.classList.toggle('scrolled', window.scrollY > 20);
        if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (backToTop) backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });

    var footerEl = document.querySelector('.footer-copy');
    if (footerEl) {
        var phrases = [
            footerEl.textContent,
            '© 2026 Mario PC · Hecho con mucho café ☕',
            '© 2026 Mario PC · 100% libre de virus (el sitio, no siempre tu PC)',
            '© 2026 Mario PC · Si llegaste hasta acá, sos mi cliente ideal',
            '© 2026 Mario PC · Gracias por curiosear 🕵️'
        ];
        var idx = 0;
        footerEl.addEventListener('click', function () {
            idx = (idx + 1) % phrases.length;
            footerEl.style.opacity = '0';
            setTimeout(function () {
                footerEl.textContent = phrases[idx];
                footerEl.style.opacity = '1';
            }, 150);
        });
    }

    document.addEventListener('click', function (e) {
        var a = e.target.closest('a[href*="wa.me"]');
        if (a && window.gtag) gtag('event', 'whatsapp_click', { page_path: location.pathname, link_text: (a.textContent || '').trim().slice(0, 40) });
    });
})();
