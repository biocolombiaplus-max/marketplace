(function () {
  "use strict";

  var API = "../api/index.php";
  var C = null;
  var dirty = false;
  var current = "brand";

  /* ---------- esquema del formulario ---------- */
  var T = {
    text: function (k, label, hint) { return { k: k, t: "text", label: label, hint: hint }; },
    area: function (k, label, hint) { return { k: k, t: "area", label: label, hint: hint, full: true }; },
    num: function (k, label, hint) { return { k: k, t: "num", label: label, hint: hint }; },
    img: function (k, label, hint) { return { k: k, t: "img", label: label, hint: hint, full: true }; },
    strs: function (k, label, hint) { return { k: k, t: "strs", label: label, hint: hint, full: true }; },
    nums: function (k, label, hint) { return { k: k, t: "nums", label: label, hint: hint }; },
    sel: function (k, label, opts) { return { k: k, t: "sel", label: label, opts: opts }; }
  };
  var ICONS = ["shield", "bolt", "cart", "receipt", "star"];

  var TABS = [
    { id: "brand", name: "Marca y WhatsApp", hint: "Nombre, logo y número que recibe todos los mensajes.", groups: [
      { title: "Identidad", path: "brand", fields: [T.text("name", "Nombre de la marca"), T.text("tagline", "Frase corta"), T.text("whatsapp", "WhatsApp (con indicativo 57, sin espacios)", "Ejemplo: 573505457420"), T.text("city", "Ciudad o cobertura"), T.img("logo", "Logo", "PNG o WEBP con fondo transparente, alto recomendado 80 px.")] }
    ] },
    { id: "marquee", name: "Franja en movimiento", hint: "Mensajes que se desplazan en la parte superior.", groups: [
      { title: "Mensajes", fields: [T.strs("marquee", "Cada línea es un mensaje")] }
    ] },
    { id: "hero", name: "Portada", hint: "Lo primero que ve el visitante.", groups: [
      { title: "Textos", path: "hero", fields: [T.text("eyebrow", "Etiqueta superior"), T.text("title", "Título"), T.text("highlight", "Título destacado (naranja)"), T.text("ctaPrimary", "Botón principal"), T.text("ctaSecondary", "Botón secundario"), T.area("subtitle", "Subtítulo"), T.img("image", "Imagen de portada", "Vertical 4:5, mínimo 900×1125 px.")] }
    ] },
    { id: "promo", name: "Banner principal", hint: "El bloque más llamativo. Su botón abre WhatsApp con el mensaje que escribas.", groups: [
      { title: "Contenido", path: "promo", fields: [T.text("kicker", "Etiqueta"), T.text("cta", "Texto del botón"), T.area("title", "Título grande"), T.area("subtitle", "Texto de apoyo"), T.area("message", "Mensaje predefinido de WhatsApp"), T.strs("points", "Puntos con check"), T.img("image", "Imagen (opcional)", "Cuadrada, mínimo 800×800 px. Si la dejas vacía se muestra el ícono de WhatsApp animado.")] }
    ] },
    { id: "partners", name: "Logos de pago", hint: "Logos de Addi, Sistecrédito u otras plataformas. Usa solo los logos oficiales que te entregue cada aliado.", groups: [
      { title: "Plataformas", list: "partners", label: function (x) { return x.name || "Plataforma"; }, blank: { name: "", logo: "", note: "" }, fields: [T.text("name", "Nombre"), T.text("note", "Descripción corta"), T.img("logo", "Logo", "Sobre fondo blanco, alto recomendado 60 px.")] }
    ] },
    { id: "simulator", name: "Simulador", hint: "Calcula una cuota de referencia y lleva al cliente a WhatsApp.", groups: [
      { title: "Textos", path: "simulator", fields: [T.text("title", "Título"), T.text("cta", "Texto del botón"), T.area("subtitle", "Subtítulo"), T.area("message", "Mensaje de WhatsApp", "Variables disponibles: {monto}, {plazo}, {cuota}"), T.area("note", "Nota legal bajo el resultado"), T.img("image", "Imagen (opcional)")] },
      { title: "Cálculo", path: "simulator", fields: [T.num("min", "Valor mínimo"), T.num("max", "Valor máximo"), T.num("step", "Salto del control"), T.num("initial", "Valor inicial"), T.nums("plazos", "Plazos (separados por coma)", "Ejemplo: 1, 3, 6, 12"), T.num("monthlyRate", "Tasa mensual de referencia (%)", "Usa la tasa vigente que publique la plataforma. 0 = sin interés.")] }
    ] },
    { id: "products", name: "Productos", hint: "Catálogo que el cliente agrega al carrito.", groups: [
      { title: "Encabezado", path: "productsSection", fields: [T.text("title", "Título"), T.area("subtitle", "Subtítulo"), T.img("image", "Imagen de sección (opcional)", "Horizontal, 1600×500 px.")] },
      { title: "Catálogo", list: "products", label: function (x) { return x.name || "Producto nuevo"; }, blank: function () { return { id: "p" + Date.now().toString(36), name: "", category: "", price: 0, oldPrice: 0, badge: "", image: "" }; },
        fields: [T.text("name", "Nombre"), T.text("category", "Categoría"), T.num("price", "Precio (COP)"), T.num("oldPrice", "Precio anterior (0 = sin tachado)"), T.text("badge", "Etiqueta (Oferta, Nuevo…)"), T.img("image", "Foto", "Horizontal 4:3, mínimo 800×600 px.")] }
    ] },
    { id: "steps", name: "Cómo funciona", hint: "Pasos del proceso, en orden.", groups: [
      { title: "Pasos", list: "steps", label: function (x) { return x.title || "Paso"; }, blank: { title: "", text: "" }, fields: [T.text("title", "Título"), T.area("text", "Descripción")] }
    ] },
    { id: "benefits", name: "Beneficios", hint: "Razones para comprar contigo.", groups: [
      { title: "Imagen de la sección", fields: [T.img("benefitsImage", "Imagen", "Cuadrada, mínimo 900×900 px.")] },
      { title: "Beneficios", list: "benefits", label: function (x) { return x.title || "Beneficio"; }, blank: { icon: "star", title: "", text: "" }, fields: [T.text("title", "Título"), T.sel("icon", "Ícono", ICONS), T.area("text", "Descripción")] }
    ] },
    { id: "testimonials", name: "Testimonios", hint: "La sección aparece cuando agregas al menos uno.", groups: [
      { note: "Publica solo testimonios reales con autorización del cliente. Inventar reseñas está prohibido por el Estatuto del Consumidor (Ley 1480 de 2011)." },
      { title: "Testimonios", list: "testimonials", label: function (x) { return x.name || "Testimonio"; }, blank: { name: "", city: "", text: "", stars: 5, photo: "" }, fields: [T.text("name", "Nombre"), T.text("city", "Ciudad"), T.num("stars", "Estrellas (1 a 5)"), T.area("text", "Testimonio"), T.img("photo", "Foto (opcional)")] }
    ] },
    { id: "faq", name: "Preguntas frecuentes", hint: "Respuestas que reducen dudas antes de escribir.", groups: [
      { title: "Preguntas", list: "faq", label: function (x) { return x.q || "Pregunta"; }, blank: { q: "", a: "" }, fields: [T.area("q", "Pregunta"), T.area("a", "Respuesta")] }
    ] },
    { id: "legal", name: "Legal y pie de página", hint: "Datos de la empresa y enlaces obligatorios.", groups: [
      { title: "Empresa", path: "legal", fields: [T.text("company", "Razón social"), T.text("nit", "NIT"), T.text("address", "Dirección"), T.text("email", "Correo de contacto"), T.area("disclaimer", "Aviso legal")] },
      { title: "Enlaces del pie", list: "footerLinks", label: function (x) { return x.label || "Enlace"; }, blank: { label: "", url: "" }, fields: [T.text("label", "Texto"), T.text("url", "Dirección (URL)")] }
    ] }
  ];

  /* ---------- utilidades ---------- */
  function $(id) { return document.getElementById(id); }
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "on") Object.keys(attrs.on).forEach(function (ev) { el.addEventListener(ev, attrs.on[ev]); });
      else if (k === "text") el.textContent = attrs[k];
      else if (attrs[k] !== false && attrs[k] != null) el.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) el.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return el;
  }
  function api(action, opts) {
    opts = opts || {};
    var init = { method: opts.method || "GET", credentials: "same-origin", headers: { "X-Requested-With": "admin" } };
    if (opts.json !== undefined) { init.method = "POST"; init.headers["Content-Type"] = "application/json"; init.body = JSON.stringify(opts.json); }
    if (opts.form) { init.method = "POST"; init.body = opts.form; }
    return fetch(API + "?action=" + action, init).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) throw new Error(j.error || "Error del servidor (" + r.status + ").");
        return j;
      });
    });
  }
  var toastT;
  function toast(msg, bad) {
    var t = $("toast"); t.textContent = msg; t.className = "toast show" + (bad ? " bad" : "");
    clearTimeout(toastT); toastT = setTimeout(function () { t.className = "toast"; }, 3000);
  }
  function previewUrl(u) { return /^(uploads|assets)\//.test(u) ? "../" + u : u; }
  function markDirty() { dirty = true; $("saveBtn").textContent = "Guardar cambios •"; }
  function merge(base, over) {
    var out = JSON.parse(JSON.stringify(base));
    Object.keys(over || {}).forEach(function (k) {
      var b = out[k], o = over[k];
      out[k] = (b && o && typeof b === "object" && !Array.isArray(b) && typeof o === "object" && !Array.isArray(o)) ? merge(b, o) : o;
    });
    return out;
  }

  /* ---------- campos ---------- */
  function field(obj, f) {
    var id = "f-" + Math.random().toString(36).slice(2, 9);
    var wrap = h("div", { class: "f" + (f.full ? " full" : "") });
    wrap.appendChild(h("label", { for: id, text: f.label }));
    var v = obj[f.k];

    if (f.t === "text" || f.t === "num") {
      wrap.appendChild(h("input", { id: id, type: f.t === "num" ? "number" : "text", step: "any", value: v == null ? "" : v, on: { input: function (e) {
        obj[f.k] = f.t === "num" ? Number(e.target.value) : e.target.value; markDirty();
      } } }));
    } else if (f.t === "area") {
      var ta = h("textarea", { id: id, on: { input: function (e) { obj[f.k] = e.target.value; markDirty(); } } });
      ta.value = v || ""; wrap.appendChild(ta);
    } else if (f.t === "sel") {
      var s = h("select", { id: id, on: { change: function (e) { obj[f.k] = e.target.value; markDirty(); } } },
        f.opts.map(function (o) { return h("option", { value: o, text: o, selected: o === v ? "selected" : false }); }));
      wrap.appendChild(s);
    } else if (f.t === "nums") {
      wrap.appendChild(h("input", { id: id, type: "text", value: (v || []).join(", "), on: { input: function (e) {
        obj[f.k] = e.target.value.split(",").map(function (x) { return parseInt(x, 10); }).filter(function (n) { return n > 0; }); markDirty();
      } } }));
    } else if (f.t === "strs") {
      wrap.querySelector("label").removeAttribute("for");
      wrap.appendChild(strList(obj, f.k));
    } else if (f.t === "img") {
      wrap.querySelector("label").removeAttribute("for");
      wrap.appendChild(imgField(obj, f.k, id));
    }
    if (f.hint) wrap.appendChild(h("small", { text: f.hint }));
    return wrap;
  }

  function strList(obj, k) {
    if (!Array.isArray(obj[k])) obj[k] = [];
    var box = h("div", { class: "list" });
    function draw() {
      box.innerHTML = "";
      obj[k].forEach(function (s, i) {
        box.appendChild(h("div", { class: "str-row" }, [
          h("input", { type: "text", value: s, "aria-label": "Mensaje " + (i + 1), on: { input: function (e) { obj[k][i] = e.target.value; markDirty(); } } }),
          h("button", { type: "button", class: "small-btn danger", text: "Quitar", on: { click: function () { obj[k].splice(i, 1); markDirty(); draw(); } } })
        ]));
      });
      box.appendChild(h("div", {}, [h("button", { type: "button", class: "small-btn", text: "+ Agregar línea", on: { click: function () { obj[k].push(""); markDirty(); draw(); } } })]));
    }
    draw();
    return box;
  }

  function imgField(obj, k, id) {
    var prev = h("div", { class: "img-prev" });
    var url = h("input", { type: "text", id: id, placeholder: "O pega la dirección de una imagen", value: obj[k] || "" });
    var file = h("input", { type: "file", accept: "image/jpeg,image/png,image/webp,image/gif", hidden: "hidden" });
    function show() {
      var u = obj[k];
      prev.style.backgroundImage = u ? 'url("' + previewUrl(u).replace(/"/g, "%22") + '")' : "";
      prev.textContent = u ? "" : "Sin imagen";
    }
    url.addEventListener("input", function () { obj[k] = url.value.trim(); markDirty(); show(); });
    file.addEventListener("change", function () {
      if (!file.files[0]) return;
      var fd = new FormData(); fd.append("file", file.files[0]);
      up.disabled = true; up.textContent = "Subiendo…";
      api("upload", { form: fd }).then(function (r) {
        obj[k] = r.url; url.value = r.url; markDirty(); show(); toast("Imagen subida. Recuerda guardar los cambios.");
      }).catch(function (e) { toast(e.message, true); }).finally(function () { up.disabled = false; up.textContent = "Subir imagen"; file.value = ""; });
    });
    var up = h("button", { type: "button", class: "small-btn primary", text: "Subir imagen", on: { click: function () { file.click(); } } });
    var rm = h("button", { type: "button", class: "small-btn danger", text: "Quitar", on: { click: function () { obj[k] = ""; url.value = ""; markDirty(); show(); } } });
    show();
    return h("div", { class: "img-field" }, [prev, h("div", { class: "img-ctrls" }, [h("div", { class: "row" }, [up, rm]), url, file])]);
  }

  /* ---------- pestañas ---------- */
  function renderTabs() {
    var nav = $("tabs"); nav.innerHTML = "";
    TABS.forEach(function (t) {
      nav.appendChild(h("button", { type: "button", "aria-current": String(t.id === current), text: t.name, on: { click: function () { current = t.id; renderTabs(); renderPanel(); } } }));
    });
  }

  function renderPanel() {
    var tab = TABS.filter(function (t) { return t.id === current; })[0];
    $("tabTitle").textContent = tab.name; $("tabHint").textContent = tab.hint;
    var panel = $("panel"); panel.innerHTML = "";
    tab.groups.forEach(function (g) {
      if (g.note) { panel.appendChild(h("div", { class: "note", text: g.note })); return; }
      var card = h("section", { class: "card" }, [h("h3", { text: g.title })]);
      if (g.list) card.appendChild(listEditor(g));
      else {
        var target = g.path ? (C[g.path] = C[g.path] || {}) : C;
        var grid = h("div", { class: "grid2" });
        g.fields.forEach(function (f) { grid.appendChild(field(target, f)); });
        card.appendChild(grid);
      }
      panel.appendChild(card);
    });
  }

  function listEditor(g) {
    if (!Array.isArray(C[g.list])) C[g.list] = [];
    var arr = C[g.list];
    var box = h("div", { class: "list" });
    function draw() {
      box.innerHTML = "";
      arr.forEach(function (item, i) {
        var title = h("b", { text: (i + 1) + ". " + g.label(item) });
        var grid = h("div", { class: "grid2" });
        g.fields.forEach(function (f) {
          var el = field(item, f);
          el.addEventListener("input", function () { title.textContent = (i + 1) + ". " + g.label(item); });
          grid.appendChild(el);
        });
        box.appendChild(h("div", { class: "item" }, [
          h("div", { class: "item-head" }, [title, h("div", { class: "row" }, [
            h("button", { type: "button", class: "small-btn", "aria-label": "Subir", text: "↑", disabled: i === 0 ? "disabled" : false, on: { click: function () { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); markDirty(); draw(); } } }),
            h("button", { type: "button", class: "small-btn", "aria-label": "Bajar", text: "↓", disabled: i === arr.length - 1 ? "disabled" : false, on: { click: function () { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); markDirty(); draw(); } } }),
            h("button", { type: "button", class: "small-btn danger", text: "Eliminar", on: { click: function () { arr.splice(i, 1); markDirty(); draw(); } } })
          ])]),
          grid
        ]));
      });
      box.appendChild(h("div", {}, [h("button", { type: "button", class: "small-btn primary", text: "+ Agregar", on: { click: function () {
        arr.push(typeof g.blank === "function" ? g.blank() : JSON.parse(JSON.stringify(g.blank))); markDirty(); draw();
      } } })]));
    }
    draw();
    return box;
  }

  /* ---------- acciones ---------- */
  function save() {
    var b = $("saveBtn"); b.disabled = true; b.textContent = "Guardando…";
    api("save", { json: C }).then(function () {
      dirty = false; toast("Cambios publicados en la página.");
      b.textContent = "Guardar cambios";
    }).catch(function (e) { toast(e.message, true); b.textContent = "Guardar cambios •"; }).finally(function () { b.disabled = false; });
  }

  function start(me) {
    $("login").hidden = true; $("shell").hidden = false;
    $("pwWarn").hidden = !me.defaultPassword;
    fetch(API + "?action=content", { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
      .then(function (remote) { C = merge(window.DEFAULT_CONTENT, remote); renderTabs(); renderPanel(); });
  }

  $("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    $("loginErr").textContent = "";
    api("login", { json: { password: $("pw").value } }).then(start).catch(function (err) { $("loginErr").textContent = err.message; });
  });
  $("logout").addEventListener("click", function () { api("logout", { method: "POST" }).finally(function () { location.reload(); }); });
  $("saveBtn").addEventListener("click", save);
  document.addEventListener("keydown", function (e) { if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); save(); } });
  window.addEventListener("beforeunload", function (e) { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

  $("exportBtn").addEventListener("click", function () {
    var a = h("a", { href: URL.createObjectURL(new Blob([JSON.stringify(C, null, 2)], { type: "application/json" })), download: "contenido-landing-" + new Date().toISOString().slice(0, 10) + ".json" });
    document.body.appendChild(a); a.click(); a.remove();
  });
  $("importFile").addEventListener("change", function (e) {
    var f = e.target.files[0]; if (!f) return;
    f.text().then(function (t) {
      var j = JSON.parse(t); if (!j.brand) throw new Error();
      C = merge(window.DEFAULT_CONTENT, j); markDirty(); renderPanel(); toast("Copia cargada. Revisa y guarda para publicarla.");
    }).catch(function () { toast("Ese archivo no es una copia válida del contenido.", true); });
    e.target.value = "";
  });

  var dlg = $("pwDialog");
  $("openPw").addEventListener("click", function () { $("pwErr").textContent = ""; dlg.showModal(); });
  $("pwCancel").addEventListener("click", function () { dlg.close(); });
  $("pwForm").addEventListener("submit", function (e) {
    e.preventDefault();
    api("password", { json: { current: $("pwCur").value, next: $("pwNew").value } }).then(function () {
      dlg.close(); $("pwWarn").hidden = true; toast("Contraseña actualizada.");
    }).catch(function (err) { $("pwErr").textContent = err.message; });
  });

  api("me").then(function (me) {
    if (me.admin) start(me); else { $("login").hidden = false; $("pw").focus(); }
  }).catch(function () {
    $("login").hidden = false;
    $("loginErr").textContent = "No hay conexión con el servidor. El panel necesita un hosting con PHP 7.4 o superior.";
  });
})();
