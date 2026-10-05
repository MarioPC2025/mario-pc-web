/* ═══════════════════════════════════════════════════════════════
   blog-lib.js — Lógica del blog: tarjetas, nota completa y schema.
   No hace falta tocar este archivo. Las notas se cargan en blog-posts.js.
   Si blog-posts.js tuviera un error, el resto del sitio sigue funcionando
   y simplemente no se muestran notas.
   ═══════════════════════════════════════════════════════════════ */
const MarioBlog = (function () {
    const SITE = 'https://www.mariopc.com.ar/';
    const WA = 'https://wa.me/5491123999259';
    const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    function author() {
        const a = (typeof AUTHOR !== 'undefined' && AUTHOR) ? AUTHOR : {};
        return { name: a.name || 'Mario', role: a.role || '', photo: a.photo || '' };
    }

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function slugify(s) {
        return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
    }

    function isIso(d) { return /^\d{4}-\d{2}-\d{2}$/.test(d || ''); }

    function formatDate(d) {
        if (!isIso(d)) return d ? String(d) : '';
        const parts = d.split('-').map(Number);
        if (parts[1] < 1 || parts[1] > 12) return d;
        return parts[2] + ' de ' + MONTHS[parts[1] - 1] + ', ' + parts[0];
    }

    /* Notas válidas (con título y contenido), la más nueva primero */
    function posts() {
        const raw = (typeof blogPosts !== 'undefined' && Array.isArray(blogPosts)) ? blogPosts : [];
        const list = raw
            .filter(function (p) { return p && p.title && p.content; })
            .map(function (p, i) {
                return Object.assign({}, p, { slug: slugify(p.slug || p.title), _i: i });
            });
        list.sort(function (a, b) {
            const da = isIso(a.date) ? a.date : '';
            const db = isIso(b.date) ? b.date : '';
            if (da !== db) return da < db ? 1 : -1;
            return a._i - b._i;
        });
        return list;
    }

    function find(slug) {
        const s = slugify(slug || '');
        return posts().filter(function (p) { return p.slug === s; })[0] || null;
    }

    /* ── Texto ── */
    function plain(content) {
        return String(content).split('\n')
            .map(function (l) { return l.trim(); })
            .filter(function (l) { return l && !/^#{2,3}\s/.test(l); })
            .map(function (l) {
                return l.replace(/^-\s+/, '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
            })
            .join(' ');
    }

    function excerptOf(p) {
        if (p.excerpt) return String(p.excerpt).trim();
        const t = plain(p.content);
        if (t.length <= 160) return t;
        const cut = t.slice(0, 160);
        return cut.slice(0, Math.max(cut.lastIndexOf(' '), 100)).replace(/[\s,;:.\-–—]+$/, '') + '…';
    }

    function minutes(p) {
        const words = plain(p.content).split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.round(words / 200));
    }

    function inline(text) {
        let t = esc(text);
        t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, label, url) {
            if (/^https?:\/\//i.test(url)) {
                return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
            }
            if (/^[\w\-\/.#?=]+$/.test(url)) {
                return '<a href="' + url + '">' + label + '</a>';
            }
            return m;
        });
        return t;
    }

    /* Texto plano con marcas simples → HTML seguro (todo se escapa antes) */
    function renderContent(content) {
        const out = [];
        let para = [];
        let list = [];
        function flushP() {
            if (para.length) { out.push('<p>' + para.map(inline).join(' ') + '</p>'); para = []; }
        }
        function flushL() {
            if (list.length) {
                out.push('<ul>' + list.map(function (li) { return '<li>' + inline(li) + '</li>'; }).join('') + '</ul>');
                list = [];
            }
        }
        String(content).replace(/\r\n/g, '\n').split('\n').forEach(function (raw) {
            const l = raw.trim();
            let m;
            if (!l) { flushP(); flushL(); return; }
            if ((m = l.match(/^(#{2,3})\s+(.+)$/))) {
                flushP(); flushL();
                const tag = m[1].length === 2 ? 'h2' : 'h3';
                out.push('<' + tag + '>' + inline(m[2]) + '</' + tag + '>');
            } else if ((m = l.match(/^-\s+(.+)$/))) {
                flushP(); list.push(m[1]);
            } else {
                flushL(); para.push(l);
            }
        });
        flushP(); flushL();
        return out.join('');
    }

    /* ── URLs ── */
    function url(p) { return 'blog.html?nota=' + encodeURIComponent(p.slug); }
    function absUrl(p) { return SITE + url(p); }
    function absAsset(path) {
        return /^https?:\/\//i.test(path) ? path : SITE + String(path).replace(/^\.?\//, '');
    }

    /* ── HTML ── */
    function cardHTML(p, level) {
        const h = 'h' + (level || 3);
        const media = p.image
            ? '<img src="' + esc(p.image) + '" alt="" loading="lazy" decoding="async">'
            : '<div class="note-card-fallback"><i class="ph-fill ph-notepad"></i></div>';
        const when = formatDate(p.date);
        return '<article class="note-card">' +
            '<a class="note-card-link" href="' + esc(url(p)) + '">' +
            '<div class="note-card-media">' + media + '</div>' +
            '<div class="note-card-body">' +
            '<div class="note-card-meta">' + (when ? esc(when) + ' · ' : '') + minutes(p) + ' min de lectura</div>' +
            '<' + h + ' class="note-card-title">' + esc(p.title) + '</' + h + '>' +
            '<p class="note-card-excerpt">' + esc(excerptOf(p)) + '</p>' +
            '<span class="note-card-more">Leer nota <i class="ph ph-arrow-right"></i></span>' +
            '</div></a></article>';
    }

    function avatarHTML(a) {
        if (a.photo) {
            return '<img class="note-avatar" src="' + esc(a.photo) + '" alt="" width="44" height="44">';
        }
        return '<span class="note-avatar note-avatar-fallback" aria-hidden="true">' + esc(a.name.charAt(0).toUpperCase()) + '</span>';
    }

    function articleHTML(p) {
        const a = author();
        const when = formatDate(p.date);
        const waText = encodeURIComponent('Hola Mario, leí tu nota "' + p.title + '" y quería hacerte una consulta');
        return '<article class="note-article">' +
            '<a class="note-back" href="blog.html"><i class="ph ph-arrow-left"></i> Volver al blog</a>' +
            '<header>' +
            '<div class="note-meta">' + (when ? esc(when) + ' · ' : '') + minutes(p) + ' min de lectura</div>' +
            '<h1 class="note-title">' + esc(p.title) + '</h1>' +
            '<div class="note-byline">' + avatarHTML(a) +
            '<div><div class="note-author">' + esc(a.name) + '</div>' +
            (a.role ? '<div class="note-author-role">' + esc(a.role) + '</div>' : '') +
            '</div></div>' +
            '</header>' +
            (p.image ? '<img class="note-cover" src="' + esc(p.image) + '" alt="' + esc(p.imageAlt || p.title) + '" fetchpriority="high">' : '') +
            '<div class="note-body">' + renderContent(p.content) + '</div>' +
            '<aside class="note-cta">' +
            '<div class="note-cta-text"><strong>¿Te pasa algo parecido con tu equipo?</strong>' +
            '<span>Contame qué le pasa y te respondo por WhatsApp. El diagnóstico no tiene cargo.</span></div>' +
            '<a class="btn-primary" href="' + WA + '?text=' + waText + '" target="_blank" rel="noopener noreferrer">' +
            '<i class="ph-fill ph-whatsapp-logo"></i> Escribir por WhatsApp</a>' +
            '</aside>' +
            '<a class="note-back note-back-bottom" href="blog.html"><i class="ph ph-arrow-left"></i> Ver todas las notas</a>' +
            '</article>';
    }

    /* Si la foto del autor no carga, se reemplaza por un círculo con la inicial */
    function wireAvatars(root) {
        const a = author();
        (root || document).querySelectorAll('img.note-avatar').forEach(function (img) {
            function fallback() {
                const span = document.createElement('span');
                span.className = 'note-avatar note-avatar-fallback';
                span.setAttribute('aria-hidden', 'true');
                span.textContent = a.name.charAt(0).toUpperCase();
                img.replaceWith(span);
            }
            img.addEventListener('error', fallback, { once: true });
            if (img.complete && img.naturalWidth === 0) fallback();
        });
    }

    /* ── Schema (JSON-LD) y metadatos ── */
    function postSchema(p) {
        const o = {
            '@type': 'BlogPosting',
            headline: p.title,
            description: excerptOf(p),
            url: absUrl(p),
            mainEntityOfPage: { '@type': 'WebPage', '@id': absUrl(p) },
            inLanguage: 'es-AR',
            author: { '@type': 'Person', name: author().name },
            publisher: {
                '@type': 'Organization',
                name: 'Mario PC',
                logo: { '@type': 'ImageObject', url: SITE + 'logo.png' }
            }
        };
        if (isIso(p.date)) o.datePublished = p.date;
        if (isIso(p.updated)) o.dateModified = p.updated;
        else if (isIso(p.date)) o.dateModified = p.date;
        if (p.image) o.image = absAsset(p.image);
        return o;
    }

    function blogSchema(list) {
        return {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'Blog — Mario PC',
            url: SITE + 'blog.html',
            inLanguage: 'es-AR',
            blogPost: list.map(postSchema)
        };
    }

    function injectJsonLd(id, obj) {
        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement('script');
            el.type = 'application/ld+json';
            el.id = id;
            document.head.appendChild(el);
        }
        el.textContent = JSON.stringify(obj).replace(/</g, '\\u003c');
    }

    function setMeta(selector, attr, value) {
        const el = document.querySelector(selector);
        if (el && value) el.setAttribute(attr, value);
    }

    function setHead(o) {
        if (o.title) document.title = o.title;
        setMeta('meta[name="description"]', 'content', o.description);
        setMeta('link[rel="canonical"]', 'href', o.url);
        setMeta('meta[property="og:url"]', 'content', o.url);
        setMeta('meta[property="og:type"]', 'content', o.type);
        setMeta('meta[property="og:title"]', 'content', o.title);
        setMeta('meta[property="og:description"]', 'content', o.description);
        setMeta('meta[property="og:image"]', 'content', o.image);
        setMeta('meta[name="twitter:title"]', 'content', o.title);
        setMeta('meta[name="twitter:description"]', 'content', o.description);
        setMeta('meta[name="twitter:image"]', 'content', o.image);
        if (o.image) {
            // el og-image genérico es 1200×630; una portada propia puede tener otro tamaño
            document.querySelectorAll('meta[property="og:image:width"], meta[property="og:image:height"]')
                .forEach(function (m) { m.remove(); });
        }
    }

    function noindex() {
        const m = document.createElement('meta');
        m.name = 'robots';
        m.content = 'noindex';
        document.head.appendChild(m);
    }

    return {
        SITE: SITE, posts: posts, find: find, url: url, absUrl: absUrl, absAsset: absAsset,
        excerptOf: excerptOf, minutes: minutes, formatDate: formatDate, renderContent: renderContent,
        cardHTML: cardHTML, articleHTML: articleHTML, wireAvatars: wireAvatars,
        postSchema: postSchema, blogSchema: blogSchema, injectJsonLd: injectJsonLd,
        setHead: setHead, noindex: noindex, esc: esc
    };
})();
