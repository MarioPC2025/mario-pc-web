/* ═══════════════════════════════════════════════════════════════
   blog-posts.js — Acá se cargan las notas del blog.
   Lo usan la home (últimas 3 notas) y blog.html (listado y nota completa).
   Instrucciones paso a paso: README.md → "Publicar una nota de blog".
   ═══════════════════════════════════════════════════════════════ */

// Autor que aparece en cada nota (foto chica + nombre). La foto va en /blog.
// Si el archivo no existe, se muestra un círculo con la inicial.
const AUTHOR = {
    name: "Mario",
    role: "Técnico · Mario PC, Olivos",
    photo: "blog/mario.jpg"
};

// Una nota por bloque { ... }, separadas por coma. La más nueva se muestra primero.
const blogPosts = [
    // {
    //     slug: "como-saber-si-tu-pc-necesita-un-ssd",
    //     title: "Cómo saber si tu PC necesita un SSD",
    //     date: "2026-10-10",
    //     image: "blog/ssd-post.jpg",
    //     imageAlt: "Disco SSD al lado de un disco rígido",
    //     excerpt: "Resumen corto que se ve en la tarjeta (1 o 2 frases).",
    //     content: `El texto completo de la nota.
    //
    // Una línea en blanco separa los párrafos.
    //
    // ## Un subtítulo
    //
    // - Un punto de lista
    // - Otro punto de lista
    //
    // Podés usar **negrita** y [un link](https://www.mariopc.com.ar).`
    // },
];
