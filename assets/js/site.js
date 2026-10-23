(function () {
  "use strict";

  var C; // contenido activo
  var cart = [];
  var chosen = []; // servicios opcionales marcados
  var CART_KEY = "cupoplus_cart";

  /* ---------- utilidades ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function safeUrl(u) {
    u = String(u || "").trim();
    if (!u) return "";
    if (/^(https?:|data:image\/|\/|\.\/|uploads\/|assets\/|#)/i.test(u)) return u;
    return "";
  }
  var fmt = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
  function money(n) { return fmt.format(Math.round(n || 0)); }
  function wa(text) {
    var num = String(C.brand.whatsapp || "").replace(/\D/g, "");
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(text);
  }
  function cuota(monto, n, rateMonthly) {
    var r = (Number(rateMonthly) || 0) / 100;
    if (!r) return monto / n;
    return monto * r / (1 - Math.pow(1 + r, -n));
  }
  function addiPct() { return Math.max(0, Math.min(90, Number(C.simulator.addiDiscount) || 0)); }
  function withAddi(n) { return n * (1 - addiPct() / 100); }
  function store(get, val) {
    try {
      if (get) return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      localStorage.setItem(CART_KEY, JSON.stringify(val));
    } catch (e) { return []; }
  }

  var ICON = {
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.86 9.86 0 0 0 12.04 2zm5.8 14.03c-.25.69-1.44 1.32-2 1.4-.51.08-1.16.11-1.87-.12-.43-.14-.98-.32-1.69-.62-2.97-1.28-4.91-4.27-5.06-4.47-.15-.2-1.21-1.6-1.21-3.06 0-1.45.76-2.17 1.03-2.47.27-.3.59-.37.79-.37h.57c.18 0 .43-.07.67.51.25.59.84 2.05.91 2.2.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.31-.13.6.17.3.77 1.27 1.65 2.06 1.14 1.01 2.1 1.33 2.4 1.48.3.15.47.12.64-.07.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.07.12.07.71-.18 1.4z"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"/><circle cx="10" cy="20.5" r="1.3"/><circle cx="17" cy="20.5" r="1.3"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
    receipt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>'
  };
  function icon(name) { return ICON[name] || ICON.star; }
  function img(src, alt, cls) {
    var u = safeUrl(src);
    return u ? '<img src="' + esc(u) + '" alt="' + esc(alt || "") + '" loading="lazy"' + (cls ? ' class="' + cls + '"' : "") + ">" : "";
  }

  /* ---------- carga de contenido ---------- */
  function load() {
    var tries = ["api/index.php?action=content", "data/content.json"];
    function next(i) {
      if (i >= tries.length) return Promise.resolve(null);
      return fetch(tries[i], { cache: "no-store" })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (j) { return j && j.brand ? j : next(i + 1); })
        .catch(function () { return next(i + 1); });
    }
    if (location.protocol === "file:") return Promise.resolve(null);
    return next(0);
  }
  function merge(base, over) {
    if (!over) return base;
    var out = {};
    Object.keys(base).forEach(function (k) { out[k] = base[k]; });
    Object.keys(over).forEach(function (k) {
      var b = base[k], o = over[k];
      out[k] = (b && o && typeof b === "object" && !Array.isArray(b) && typeof o === "object" && !Array.isArray(o)) ? merge(b, o) : o;
    });
    return out;
  }

  /* ---------- render ---------- */
  function render() {
    var b = C.brand, h = C.hero, p = C.promo, s = C.simulator;
    var cheapest = (C.products || []).reduce(function (m, x) { return !m || x.price < m.price ? x : m; }, null);
    var maxPlazo = Math.max.apply(null, s.plazos || [12]);
    var sampleAmount = cheapest ? cheapest.price : s.initial;

    var logo = b.logo ? img(b.logo, b.name) : '<span class="logo-mark">' + esc((b.name || "C").charAt(0)) + "</span>" + esc(b.name);

    var marqueeItems = (C.marquee || []).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("");

    var partners = (C.partners || []).map(function (x) {
      return '<span class="partner" title="' + esc(x.note) + '">' + (x.logo ? img(x.logo, x.name) : esc(x.name)) + "</span>";
    }).join("");

    var heroArt = h.image ? img(h.image, b.name) :
      '<div class="ph-art"><svg viewBox="0 0 200 240" width="62%" aria-hidden="true"><rect x="40" y="10" width="120" height="220" rx="22" fill="#0a0f24" stroke="rgba(255,255,255,.18)" stroke-width="2"/><rect x="54" y="40" width="92" height="58" rx="12" fill="#ff6a00"/><rect x="54" y="110" width="92" height="10" rx="5" fill="rgba(255,255,255,.25)"/><rect x="54" y="128" width="64" height="10" rx="5" fill="rgba(255,255,255,.15)"/><rect x="54" y="168" width="92" height="36" rx="18" fill="#3ee0a5"/><text x="100" y="76" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="22" fill="#fff">' + esc(maxPlazo) + 'x</text><text x="100" y="191" text-anchor="middle" font-family="Figtree, sans-serif" font-weight="800" font-size="12" fill="#053">Aprobado</text></svg></div>';

    var promoVisual = p.image ? img(p.image, p.title) : '<div class="wa-orb">' + icon("wa") + "</div>";

    var plazoChips = (s.plazos || []).map(function (n, i) {
      return '<button type="button" class="chip" data-plazo="' + esc(n) + '" aria-pressed="' + (i === Math.floor((s.plazos.length - 1) / 2) ? "true" : "false") + '">' + esc(n) + (n == 1 ? " cuota" : " cuotas") + "</button>";
    }).join("");

    var cats = ["Todos"].concat((C.products || []).map(function (x) { return x.category; }).filter(function (v, i, a) { return v && a.indexOf(v) === i; }));
    var catChips = cats.length > 2 ? cats.map(function (c, i) {
      return '<button type="button" class="chip" data-cat="' + esc(c) + '" aria-pressed="' + (i === 0) + '">' + esc(c) + "</button>";
    }).join("") : "";

    var steps = (C.steps || []).map(function (x) {
      return '<div class="step reveal"><h3>' + esc(x.title) + "</h3><p>" + esc(x.text) + "</p></div>";
    }).join("");

    var benefits = (C.benefits || []).map(function (x) {
      return '<div class="benefit"><span class="ico">' + icon(x.icon) + "</span><h3>" + esc(x.title) + "</h3><p>" + esc(x.text) + "</p></div>";
    }).join("");
    var benefitsMedia = C.benefitsImage ? img(C.benefitsImage, "") :
      '<svg viewBox="0 0 200 200" width="55%" aria-hidden="true"><path d="M100 20l60 22v46c0 38-25 70-60 82-35-12-60-44-60-82V42z" fill="rgba(255,106,0,.14)" stroke="#ff9a1f" stroke-width="3"/><path d="M72 102l20 20 38-40" fill="none" stroke="#3ee0a5" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var testis = (C.testimonials || []).filter(function (t) { return t && t.text; });
    var testiHtml = testis.length ? '<section class="section" id="opiniones"><div class="wrap"><div class="section-head"><span class="eyebrow">Clientes reales</span><h2>Lo que dicen quienes ya compraron</h2></div><div class="testis">' +
      testis.map(function (t) {
        return '<figure class="testi" style="margin:0"><div class="stars" aria-label="' + esc(t.stars || 5) + ' de 5">' + "★★★★★".slice(0, Math.max(1, Math.min(5, t.stars || 5))) + "</div><p>“" + esc(t.text) + '”</p><footer>' + (t.photo ? img(t.photo, t.name) : '<span class="av"></span>') + "<div><b>" + esc(t.name) + "</b><br>" + esc(t.city) + "</div></footer></figure>";
      }).join("") + "</div></div></section>" : "";

    var faq = (C.faq || []).map(function (x, i) {
      return "<details" + (i === 0 ? " open" : "") + "><summary>" + esc(x.q) + "</summary><p>" + esc(x.a) + "</p></details>";
    }).join("");

    var links = (C.footerLinks || []).map(function (l) {
      var u = safeUrl(l.url) || "#";
      return '<a href="' + esc(u) + '"' + (/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : "") + ">" + esc(l.label) + "</a>";
    }).join("");

    document.getElementById("app").innerHTML =
      '<div class="marquee" role="marquee" aria-label="Novedades"><div class="marquee-track">' + marqueeItems + marqueeItems + "</div></div>" +
      '<header class="header"><div class="wrap"><a class="logo" href="#top" aria-label="' + esc(b.name) + '">' + logo + "</a>" +
      '<nav class="nav" aria-label="Principal"><a href="#productos">Productos</a><a href="#simulador">Simulador</a><a href="#como-funciona">Cómo funciona</a><a href="#preguntas">Preguntas</a></nav>' +
      '<div class="header-actions"><button class="cart-btn" type="button" id="openCart" aria-label="Abrir carrito">' + icon("cart") + '<b class="cart-count num" id="cartCount">0</b></button>' +
      '<a class="btn btn-fire" href="' + esc(wa(p.message)) + '" target="_blank" rel="noopener">' + icon("wa") + "<span>Hablar con un asesor</span></a></div></div></header>" +

      '<main id="top">' +
      '<section class="promo promo-lead" id="cupo"><div class="wrap"><div class="promo-card"><div class="promo-inner"><div class="promo-copy">' +
      '<span class="promo-kicker">● ' + esc(p.kicker) + "</span><h2>" + esc(p.title) + (p.highlight ? " <em>" + esc(p.highlight) + "</em>" : "") + "</h2><p>" + esc(p.subtitle) + "</p>" +
      '<ul class="promo-points">' + (p.points || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" +
      '<div><a class="btn btn-fire btn-xl" href="' + esc(wa(p.message)) + '" target="_blank" rel="noopener">' + icon("wa") + esc(p.cta) + "</a></div></div>" +
      '<div class="promo-visual">' + promoVisual + "</div></div></div></div></section>" +

      '<section class="hero"><div class="wrap"><div class="hero-copy">' +
      '<span class="pill reveal"><i></i>' + esc(h.eyebrow) + "</span>" +
      '<h1 class="reveal">' + esc(h.title) + "<em>" + esc(h.highlight) + "</em></h1>" +
      '<p class="hero-sub reveal">' + esc(h.subtitle) + "</p>" +
      '<div class="hero-ctas reveal"><a class="btn btn-fire btn-xl" href="#productos">' + esc(h.ctaPrimary) + ' →</a><a class="btn btn-ghost btn-xl" href="#simulador">' + esc(h.ctaSecondary) + "</a></div>" +
      '<div class="partners"><small>Paga con</small>' + partners + "</div></div>" +
      '<div class="hero-visual"><div class="hero-photo">' + heroArt + "</div>" +
      '<div class="status-chip"><i>✓</i>Pago en app oficial</div>' +
      '<div class="quote-card"><small>Cuota de referencia desde</small><strong class="num">' + money(cuota(sampleAmount, maxPlazo, s.monthlyRate)) + " <span>/mes</span></strong>" +
      '<span style="color:var(--muted);font-size:.85rem">' + esc(cheapest ? cheapest.name : "Tu compra") + " · " + esc(maxPlazo) + ' cuotas</span><div class="bar"><i></i></div></div></div></div></section>' +

      '<section class="section sim" id="simulador"><div class="wrap"><div class="section-head"><span class="eyebrow">Simulador</span><h2>' + esc(s.title) + "</h2><p>" + esc(s.subtitle) + "</p></div>" +
      '<div class="sim-grid"><div class="sim-panel">' +
      '<div class="field"><div class="field-top"><label for="simRange">¿Cuánto cupo quieres usar?</label><output class="amount-out num" id="simOut" for="simRange"></output></div>' +
      '<input type="range" id="simRange" min="' + esc(s.min) + '" max="' + esc(s.max) + '" step="' + esc(s.step) + '" value="' + esc(s.initial) + '">' +
      '<div class="range-scale num"><span>' + money(s.min) + "</span><span>" + money(s.max) + "</span></div>" +
      '<input class="amount-input num" id="simInput" inputmode="numeric" aria-label="Escribe el valor exacto" placeholder="Escribe un valor exacto"></div>' +
      '<div class="field"><span class="lbl" id="plazoLbl">Número de cuotas</span><div class="chips" role="group" aria-labelledby="plazoLbl" id="plazos">' + plazoChips + "</div></div>" +
      '<div class="field"><span class="lbl">Plataforma</span><div class="pay-choice"><label><input type="radio" name="simPay" value="Addi" checked><span>Addi</span></label><label><input type="radio" name="simPay" value="Sistecrédito"><span>Sistecrédito</span></label></div></div>' +
      "</div>" +
      '<div class="sim-result" aria-live="polite"><span class="eyebrow">Tu cuota de referencia</span><div class="big-quote num" id="simCuota"></div>' +
      '<div class="save-pill" id="simSave"></div><div class="breakdown num"><div><span>Valor de los productos</span><b id="bdMonto"></b></div><div id="bdDescRow"><span id="bdDescLbl"></span><b id="bdDesc" class="neg"></b></div><div><span>Usas de tu cupo</span><b id="bdUso"></b></div><div><span>Plazo</span><b id="bdPlazo"></b></div><div><span>Total aproximado en cuotas</span><b id="bdTotal"></b></div></div>' +
      '<a class="btn btn-fire btn-xl btn-block" id="simCta" href="#" target="_blank" rel="noopener">' + icon("wa") + esc(s.cta) + "</a>" +
      '<p class="sim-note">' + esc(s.note) + "</p>" + (s.image ? img(s.image, "") : "") + "</div></div></div></section>" +

      '<section class="section" id="productos"><div class="wrap"><div class="section-head"><span class="eyebrow">Catálogo</span><h2>' + esc(C.productsSection.title) + "</h2><p>" + esc(C.productsSection.subtitle) + "</p></div>" +
      (C.productsSection.image ? '<div style="margin:-10px 0 30px;border-radius:24px;overflow:hidden">' + img(C.productsSection.image, "") + "</div>" : "") +
      (catChips ? '<div class="toolbar chips" role="group" aria-label="Filtrar por categoría" id="cats">' + catChips + "</div>" : "") +
      '<div class="grid-products" id="grid"></div></div></section>' +

      '<section class="section sim" id="como-funciona"><div class="wrap"><div class="section-head"><span class="eyebrow">Cómo funciona</span><h2>De tu carrito a tu casa en cuatro pasos</h2></div><div class="steps">' + steps + "</div></div></section>" +

      '<section class="section"><div class="wrap benefits-wrap"><div class="benefits-media">' + benefitsMedia + '</div><div><div class="section-head"><span class="eyebrow">Por qué con nosotros</span><h2>Compra con la tranquilidad de un proceso claro</h2></div><div class="benefits">' + benefits + "</div></div></div></section>" +

      testiHtml +

      '<section class="section sim" id="preguntas"><div class="wrap faq-wrap"><div class="section-head"><span class="eyebrow">Preguntas frecuentes</span><h2>Resolvemos tus dudas antes de comprar</h2><p>¿No ves tu pregunta? Escríbenos y te respondemos por WhatsApp.</p><div><a class="btn btn-ghost" href="' + esc(wa("Hola 👋 Tengo una pregunta sobre cómo comprar con Addi o Sistecrédito.")) + '" target="_blank" rel="noopener">' + icon("wa") + 'Hacer una pregunta</a></div></div><div class="faq">' + faq + "</div></div></section>" +

      '<section class="section closing"><div class="wrap"><span class="eyebrow">Tu cupo, tu decisión</span><h2>Arma tu pedido hoy y págalo a cuotas.</h2><p>Un asesor revisa tu pedido contigo y te envía el enlace oficial de pago.</p>' +
      '<a class="btn btn-fire btn-xl" href="' + esc(wa(p.message)) + '" target="_blank" rel="noopener">' + icon("wa") + esc(p.cta) + "</a>" +
      '<div class="safety">' + icon("shield").replace("<svg", '<svg width="22" height="22"') + "Nunca te pediremos claves ni códigos de verificación. El pago se hace solo en la app oficial.</div></div></section>" +
      "</main>" +

      '<footer class="footer"><div class="wrap"><div class="footer-top"><div><a class="logo" href="#top">' + logo + '</a><p style="margin-top:10px">' + esc(b.tagline) + '</p></div><div class="footer-links">' + links + "</div></div>" +
      '<p class="disclaimer">' + esc(C.legal.disclaimer) + "</p>" +
      '<p class="disclaimer">' + esc(C.legal.company) + " · " + esc(C.legal.nit) + " · " + esc(C.legal.address) + " · " + esc(C.legal.email) + " · © " + new Date().getFullYear() + "</p></div></footer>" +

      '<a class="wa-float" href="' + esc(wa(p.message)) + '" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">' + icon("wa") + "<span>WhatsApp</span></a>" +
      '<div class="drawer-backdrop" id="backdrop"></div>' +
      '<aside class="drawer" id="drawer" aria-label="Carrito" aria-hidden="true"><div class="drawer-head"><h3>Tu pedido</h3><button class="icon-btn" type="button" id="closeCart" aria-label="Cerrar carrito">×</button></div>' +
      '<div class="drawer-items" id="cartItems"></div>' +
      '<div class="drawer-foot">' + servicesHtml() + '<span class="lbl" style="font-weight:700;font-size:.9rem">¿Con qué vas a pagar?</span><div class="pay-choice"><label><input type="radio" name="cartPay" value="Addi" checked><span>Addi</span></label><label><input type="radio" name="cartPay" value="Sistecrédito"><span>Sistecrédito</span></label></div>' +
      '<div class="total" id="cartSrvRow" style="font-size:.95rem"><span>Servicios adicionales</span><b class="num" id="cartSrv" style="font-size:1rem"></b></div><div class="total" id="cartDescRow" style="font-size:.95rem"><span>Descuento exclusivo Addi</span><b class="num neg" id="cartDesc" style="font-size:1rem"></b></div><div class="total"><span>Total</span><b class="num" id="cartTotal">$0</b></div>' +
      '<a class="btn btn-fire btn-block" id="checkout" href="#" target="_blank" rel="noopener">' + icon("wa") + "Enviar pedido por WhatsApp</a>" +
      "<small>Te respondemos con el enlace oficial de pago. Sin compromiso.</small></div></aside>" +
      '<div class="toast" id="toast" role="status"></div>';

    renderProducts("Todos");
    bind();
    updateSim();
    updateCart();
  }

  function renderProducts(cat) {
    var s = C.simulator, maxPlazo = Math.max.apply(null, s.plazos || [12]);
    document.getElementById("grid").innerHTML = (C.products || []).filter(function (x) {
      return cat === "Todos" || x.category === cat;
    }).map(function (x) {
      var inCart = cart.some(function (l) { return l.id === x.id; });
      return '<article class="product"><div class="product-media">' + (x.image ? img(x.image, x.name) : '<span class="ph">' + ICON.box + "</span>") +
        (x.badge ? '<span class="badge">' + esc(x.badge) + "</span>" : "") + '</div><div class="product-body"><span class="product-cat">' + esc(x.category) + "</span><h3>" + esc(x.name) + "</h3>" +
        '<div class="price-row num"><span class="price">' + money(x.price) + "</span>" + (x.oldPrice > x.price ? '<span class="old">' + money(x.oldPrice) + "</span>" : "") + "</div>" +
        (addiPct() ? '<span class="addi-price num">Con Addi: <b>' + money(withAddi(x.price)) + "</b> (−" + addiPct() + "%)</span>" : "") +
        '<span class="from num">Desde ' + money(cuota(withAddi(x.price), maxPlazo, s.monthlyRate)) + "/mes · " + esc(maxPlazo) + " cuotas*</span></div>" +
        '<div class="product-foot"><button type="button" class="btn ' + (inCart ? "btn-fire added" : "btn-fire") + '" data-add="' + esc(x.id) + '">' + (inCart ? "✓ En tu pedido · agregar otro" : "Agregar al pedido") + "</button></div></article>";
    }).join("");
  }

  /* ---------- simulador ---------- */
  var plazo;
  function updateSim() {
    var s = C.simulator;
    var r = document.getElementById("simRange");
    var monto = Number(r.value);
    if (!plazo) {
      var pressed = document.querySelector("#plazos [aria-pressed=true]");
      plazo = pressed ? Number(pressed.dataset.plazo) : s.plazos[0];
    }
    var plat = (document.querySelector("input[name=simPay]:checked") || {}).value || "Addi";
    var pct = plat === "Addi" ? addiPct() : 0;
    var ahorro = monto * pct / 100, uso = monto - ahorro;
    var c = cuota(uso, plazo, s.monthlyRate);
    document.getElementById("simOut").textContent = money(monto);
    document.getElementById("simCuota").innerHTML = money(c) + " <small>/ mes</small>";
    document.getElementById("bdMonto").textContent = money(monto);
    document.getElementById("bdDescRow").hidden = !pct;
    document.getElementById("bdDescLbl").textContent = "Descuento exclusivo Addi (" + pct + "%)";
    document.getElementById("bdDesc").textContent = "− " + money(ahorro);
    document.getElementById("bdUso").textContent = money(uso);
    var sv = document.getElementById("simSave");
    sv.hidden = !pct;
    sv.textContent = "Ahorras " + money(ahorro) + " pagando con Addi";
    document.getElementById("bdPlazo").textContent = plazo + (plazo == 1 ? " cuota" : " cuotas");
    document.getElementById("bdTotal").textContent = money(c * plazo);
    var fill = (monto - s.min) / (s.max - s.min) * 100;
    r.style.background = "linear-gradient(90deg, var(--fire) " + fill + "%, rgba(255,255,255,.1) " + fill + "%)";
    var msg = String(s.message || "").replace("{monto}", money(monto)).replace("{plazo}", plazo).replace("{cuota}", money(c)).replace("{ahorro}", money(ahorro)) + " Plataforma: " + plat + ".";
    document.getElementById("simCta").href = wa(msg);
  }

  /* ---------- servicios opcionales ---------- */
  function services() { return (C.services || []).filter(function (x) { return x && x.name; }); }
  function servicesHtml() {
    var list = services();
    if (!list.length) return "";
    return '<fieldset class="services"><legend>' + esc(C.servicesTitle || "Servicios opcionales") + "</legend>" + list.map(function (x) {
      return '<label class="srv"><input type="checkbox" value="' + esc(x.id) + '"><span><b>' + esc(x.name) + '</b><small>' + esc(x.desc) + '</small></span><em class="num">+ ' + money(x.price) + "</em></label>";
    }).join("") + "</fieldset>";
  }

  /* ---------- carrito ---------- */
  function updateCart() {
    var items = document.getElementById("cartItems");
    var count = cart.reduce(function (a, l) { return a + l.qty; }, 0);
    var total = 0;
    var el = document.getElementById("cartCount");
    el.textContent = count;
    if (!cart.length) {
      items.innerHTML = '<div class="empty"><b style="color:var(--fg)">Tu pedido está vacío</b><span>Agrega uno o varios productos y envíalo en un solo mensaje.</span><a class="btn btn-ghost" href="#productos" data-close>Ver productos</a></div>';
    } else {
      items.innerHTML = cart.map(function (l) {
        var p = find(l.id); if (!p) return "";
        total += p.price * l.qty;
        return '<div class="line">' + (p.image ? img(p.image, p.name, "thumb") : '<span class="thumb" style="display:grid;place-items:center;color:rgba(255,255,255,.3);padding:14px">' + ICON.box + "</span>") +
          "<div><h4>" + esc(p.name) + '</h4><span class="lp num">' + money(p.price) + '</span><div class="qty"><button type="button" data-dec="' + esc(p.id) + '" aria-label="Quitar uno">−</button><span class="num">' + l.qty + '</span><button type="button" data-inc="' + esc(p.id) + '" aria-label="Agregar uno">+</button></div></div>' +
          '<button type="button" class="rm" data-rm="' + esc(p.id) + '">Quitar</button></div>';
      }).join("");
    }
    var plat = (document.querySelector("input[name=cartPay]:checked") || {}).value || "Addi";
    var desc = plat === "Addi" && cart.length ? total * addiPct() / 100 : 0;
    document.getElementById("cartDescRow").hidden = !desc;
    document.getElementById("cartDesc").textContent = "− " + money(desc);
    total -= desc;
    var srv = cart.length ? services().filter(function (x) { return chosen.indexOf(x.id) > -1; }) : [];
    var srvTotal = srv.reduce(function (a, x) { return a + (Number(x.price) || 0); }, 0);
    document.getElementById("cartSrvRow").hidden = !srvTotal;
    document.getElementById("cartSrv").textContent = "+ " + money(srvTotal);
    total += srvTotal;
    document.getElementById("cartTotal").textContent = money(total);
    var lines = cart.map(function (l) { var p = find(l.id); return p ? "• " + l.qty + " x " + p.name + " — " + money(p.price * l.qty) : ""; }).filter(Boolean);
    var msg = "Hola 👋 Quiero hacer este pedido para pagar con " + plat + ":\n\n" + lines.join("\n") + (srv.length ? "\n\nServicios adicionales:\n" + srv.map(function (x) { return "• " + x.name + " — " + money(x.price); }).join("\n") : "") + (desc ? "\n\nDescuento Addi (" + addiPct() + "%): − " + money(desc) : "") + "\n\nTotal: " + money(total) + "\n\n¿Me confirman disponibilidad y el enlace de pago?";
    var co = document.getElementById("checkout");
    co.href = cart.length ? wa(msg) : "#productos";
    co.toggleAttribute("aria-disabled", !cart.length);
    store(false, cart);
  }
  function find(id) { return (C.products || []).filter(function (p) { return p.id === id; })[0]; }
  function add(id, n) {
    var l = cart.filter(function (x) { return x.id === id; })[0];
    if (l) l.qty += n; else if (n > 0) cart.push({ id: id, qty: n });
    cart = cart.filter(function (x) { return x.qty > 0; });
  }
  function openCart(open) {
    document.body.classList.toggle("cart-open", open);
    document.getElementById("drawer").setAttribute("aria-hidden", String(!open));
  }
  var toastT;
  function toast(t) {
    var el = document.getElementById("toast");
    el.textContent = t; el.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove("show"); }, 2200);
  }

  /* ---------- eventos ---------- */
  function bind() {
    var s = C.simulator;
    var r = document.getElementById("simRange");
    r.addEventListener("input", function () { document.getElementById("simInput").value = ""; updateSim(); });
    document.getElementById("simInput").addEventListener("input", function (e) {
      var v = Number(e.target.value.replace(/\D/g, ""));
      e.target.value = v ? v.toLocaleString("es-CO") : "";
      if (v) { r.value = Math.min(s.max, Math.max(s.min, v)); updateSim(); }
    });
    document.getElementById("plazos").addEventListener("click", function (e) {
      var b = e.target.closest("[data-plazo]"); if (!b) return;
      this.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c === b)); });
      plazo = Number(b.dataset.plazo); updateSim();
    });
    document.querySelectorAll("input[name=simPay]").forEach(function (i) { i.addEventListener("change", updateSim); });
    document.querySelectorAll("input[name=cartPay]").forEach(function (i) { i.addEventListener("change", updateCart); });
    document.querySelectorAll(".services input").forEach(function (i) {
      i.addEventListener("change", function () {
        chosen = Array.prototype.map.call(document.querySelectorAll(".services input:checked"), function (x) { return x.value; });
        updateCart();
      });
    });

    var cats = document.getElementById("cats");
    if (cats) cats.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cat]"); if (!b) return;
      cats.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c === b)); });
      renderProducts(b.dataset.cat);
    });

    document.getElementById("grid").addEventListener("click", function (e) {
      var b = e.target.closest("[data-add]"); if (!b) return;
      add(b.dataset.add, 1); updateCart();
      b.classList.add("added"); b.textContent = "✓ En tu pedido · agregar otro";
      var c = document.getElementById("cartCount"); c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump");
      toast("Agregado a tu pedido");
    });
    document.getElementById("cartItems").addEventListener("click", function (e) {
      var t = e.target;
      if (t.dataset.inc) add(t.dataset.inc, 1);
      else if (t.dataset.dec) add(t.dataset.dec, -1);
      else if (t.dataset.rm) add(t.dataset.rm, -1e9);
      else if (t.hasAttribute("data-close")) { openCart(false); return; }
      else return;
      updateCart();
      var active = document.querySelector("#cats [aria-pressed=true]");
      renderProducts(active ? active.dataset.cat : "Todos");
    });
    document.getElementById("checkout").addEventListener("click", function (e) {
      if (!cart.length) { e.preventDefault(); openCart(false); location.hash = "productos"; }
    });
    document.getElementById("openCart").addEventListener("click", function () { openCart(true); });
    document.getElementById("closeCart").addEventListener("click", function () { openCart(false); });
    document.getElementById("backdrop").addEventListener("click", function () { openCart(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") openCart(false); });
  }

  /* ---------- inicio ---------- */
  cart = store(true) || [];
  load().then(function (remote) {
    C = merge(window.DEFAULT_CONTENT, remote);
    cart = cart.filter(function (l) { return find(l.id); });
    if (C.brand && C.brand.name) document.title = C.brand.name + " · " + (C.brand.tagline || "Compra a cuotas");
    render();
  });
})();
