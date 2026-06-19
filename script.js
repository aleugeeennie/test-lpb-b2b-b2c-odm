/* ============================================================
   ODM — Optimus Duo Mundi · Lógica compartida
   Detecta qué bloques existen en cada página y los activa.
   ============================================================ */

/* ---------- CONFIG ---------- *
 * [A VALIDAR CON CLIENTE] — Reemplazar por el número real de WhatsApp
 * en formato internacional sin signos, ej: "5215512345678".
 * Si se deja vacío, el botón de WhatsApp lleva al formulario de contacto. */
const ODM = {
  whatsapp: "",                 // ej. "5215512345678"
  waMessageB2C: "Hola, quiero información sobre los programas de ODM.",
  waMessageB2B: "Hola, represento a una empresa y quiero agendar un diagnóstico con ODM.",
  // [A VALIDAR CON CLIENTE] — URL real de Calendly para agendar el diagnóstico B2B.
  calendly: "https://calendly.com/odm-diagnostico/30min",
};

document.addEventListener("DOMContentLoaded", () => {
  initWhatsApp();
  initNavbar();
  initMobileMenu();
  initMarquee();
  initTabs();
  initFAQ();
  initReveal();
  initForm();
  initThanks();
});

/* ---------- WhatsApp ---------- */
function initWhatsApp() {
  const page = document.body.dataset.page || "";
  const msg = page === "b2b" ? ODM.waMessageB2B : ODM.waMessageB2C;
  const fallback = document.getElementById("lead") ? "#lead" : (page === "b2b" ? "b2b.html#lead" : "b2c.html#lead");
  const href = ODM.whatsapp
    ? `https://wa.me/${ODM.whatsapp}?text=${encodeURIComponent(msg)}`
    : fallback;
  document.querySelectorAll("[data-wa]").forEach(a => {
    a.setAttribute("href", href);
    if (ODM.whatsapp) a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener");
  });
}

/* ---------- Navbar: transparente -> sólida con blur ---------- */
function initNavbar() {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- Menú hamburguesa mobile ---------- */
function initMobileMenu() {
  const burger = document.querySelector(".hamburger");
  const menu = document.querySelector(".mobile-menu");
  const overlay = document.querySelector(".overlay");
  if (!burger || !menu) return;

  const close = () => {
    burger.classList.remove("open");
    menu.classList.remove("open");
    overlay && overlay.classList.remove("open");
    document.body.style.overflow = "";
  };
  const toggle = () => {
    const open = menu.classList.toggle("open");
    burger.classList.toggle("open", open);
    overlay && overlay.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", toggle);
  overlay && overlay.addEventListener("click", close);
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
}

/* ---------- Marquee + carruseles: duplica contenido para loop infinito ---------- */
function initMarquee() {
  document.querySelectorAll(".marquee-track").forEach(track => {
    track.innerHTML += track.innerHTML; // 2x para que el -50% sea continuo
  });
  // Carrusel de testimoniales: duplica cada fila para que el bucle al -50% no salte
  document.querySelectorAll(".t-row").forEach(row => {
    row.innerHTML += row.innerHTML;
  });
  // Las fotos aparecen al cargar; si fallan, el onerror las quita y quedan las iniciales
  document.querySelectorAll(".t-avatar img").forEach(img => {
    const show = () => { img.style.opacity = 1; };
    if (img.complete && img.naturalWidth > 0) show();
    else img.addEventListener("load", show);
  });
}

/* ---------- Tabs (programas / casos de uso) ---------- */
function initTabs() {
  document.querySelectorAll("[data-tabs]").forEach(group => {
    const btns = group.querySelectorAll(".tab-btn");
    const panels = group.querySelectorAll(".tab-panel");
    btns.forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.tab;
        btns.forEach(b => {
          const active = b === btn;
          b.classList.toggle("active", active);
          b.setAttribute("aria-selected", active ? "true" : "false");
        });
        panels.forEach(p => p.classList.toggle("active", p.dataset.panel === id));
      });
    });
  });
}

/* ---------- FAQ accordion ---------- */
function initFAQ() {
  document.querySelectorAll(".faq-item").forEach(item => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      // cierra los demás
      item.closest(".faq").querySelectorAll(".faq-item.open").forEach(o => {
        if (o !== item) { o.classList.remove("open"); o.querySelector(".faq-a").style.maxHeight = null; o.querySelector(".faq-q").setAttribute("aria-expanded", "false"); }
      });
      item.classList.toggle("open", !isOpen);
      q.setAttribute("aria-expanded", !isOpen ? "true" : "false");
      a.style.maxHeight = !isOpen ? a.scrollHeight + "px" : null;
    });
  });
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || !els.length) {
    els.forEach(e => e.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  els.forEach(e => io.observe(e));
}

/* ---------- Formulario de lead ---------- */
const FREE_DOMAINS = ["gmail.com","hotmail.com","outlook.com","yahoo.com","hotmail.es","outlook.es","yahoo.com.mx","live.com","icloud.com"];

function initForm() {
  const form = document.querySelector("form.lead-form");
  if (!form) return;
  const page = document.body.dataset.page || "b2c";

  // Validación en vivo del correo corporativo (solo B2B)
  const emailField = form.querySelector('[data-corp-email]');
  if (emailField) {
    const wrap = emailField.closest(".field");
    const validate = () => {
      const v = emailField.value.trim().toLowerCase();
      const okFormat = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
      const domain = v.split("@")[1] || "";
      const isFree = FREE_DOMAINS.includes(domain);
      const valid = okFormat && !isFree;
      wrap.classList.toggle("invalid", v.length > 3 && !valid);
      wrap.classList.toggle("valid", valid);
      return valid;
    };
    emailField.addEventListener("input", validate);
    emailField.addEventListener("blur", validate);
    form.dataset.validateEmail = "1";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (form.dataset.validateEmail) {
      const v = emailField.value.trim().toLowerCase();
      const okFormat = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
      const domain = v.split("@")[1] || "";
      if (!okFormat || FREE_DOMAINS.includes(domain)) {
        emailField.closest(".field").classList.add("invalid");
        emailField.focus();
        return;
      }
    }
    // (Integrar aquí el envío real a CRM / Pipedrive / email.)
    window.location.href = `gracias.html?audiencia=${page}`;
  });
}

/* ---------- Página de gracias: mensaje + Calendly según audiencia ---------- */
function initThanks() {
  const el = document.querySelector("[data-thanks-msg]");
  if (!el) return;
  const params = new URLSearchParams(window.location.search);
  const aud = params.get("audiencia");
  const back = document.querySelector("[data-thanks-back]");
  const cal = document.querySelector("[data-calendly]");

  if (aud === "b2c") {
    el.textContent = "Gracias, ya recibimos tu información. Un asesor de ODM te contactará para platicarte sobre tu inscripción.";
    if (back) { back.setAttribute("href", "b2c.html"); back.textContent = "Volver al inicio"; }
  } else if (aud === "b2b") {
    el.textContent = "Gracias, ya recibimos tu información. Agenda aquí tu diagnóstico con un asesor corporativo de ODM.";
    if (back) { back.setAttribute("href", "b2b.html"); back.textContent = "Volver al programa empresarial"; }
  } else {
    el.textContent = "Gracias, ya recibimos tu información. Agenda una llamada con un asesor de ODM o espera nuestro contacto.";
    if (back) { back.setAttribute("href", "b2c.html"); back.textContent = "Volver al inicio"; }
  }

  // Calendly: se muestra para empresas (b2b) y por defecto; se oculta en el flujo b2c puro.
  if (cal) {
    const showCal = aud !== "b2c";
    cal.style.display = showCal ? "" : "none";
    if (showCal) loadCalendly(cal);
  }
}

function loadCalendly(container) {
  const widget = container.querySelector(".calendly-inline-widget");
  if (widget && ODM.calendly) widget.setAttribute("data-url", ODM.calendly + "?hide_gdpr_banner=1&primary_color=ff7c10");
  if (document.getElementById("calendly-js")) return;
  const s = document.createElement("script");
  s.id = "calendly-js";
  s.src = "https://assets.calendly.com/assets/external/widget.js";
  s.async = true;
  document.body.appendChild(s);
}
