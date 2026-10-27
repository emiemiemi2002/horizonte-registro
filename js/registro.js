(function () {
  "use strict";
  var CFG = window.HORIZONTE_CONFIG || {};
  var form = document.getElementById("registro");
  var btn = document.getElementById("enviar");
  var msg = document.getElementById("form-msg");
  var area = document.getElementById("area");
  var otraWrap = document.getElementById("otra-wrap");
  var otra = document.getElementById("area_otra");
  var DEMO = !CFG.ENDPOINT;

  if (DEMO) document.getElementById("demo").hidden = false;

  area.addEventListener("change", function () {
    var esOtra = area.value === "Otra";
    otraWrap.hidden = !esOtra;
    otra.required = esOtra;
    if (esOtra) otra.focus();
    else setError("area_otra", "");
    setError("area", "");
  });

  // Limpia: espacios dobles, recorta, y pone mayúscula inicial si todo viene en minúsculas.
  function limpiar(v) {
    v = String(v || "").replace(/\s+/g, " ").trim();
    if (v && v === v.toLowerCase()) {
      v = v.replace(/(^|\s)(\S)/g, function (m, s, c) { return s + c.toUpperCase(); });
    }
    return v;
  }
  var LETRAS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]+$/;

  function setError(id, texto) {
    var el = document.getElementById(id + "-err");
    var field = document.getElementById(id).closest(".field");
    if (el) el.textContent = texto;
    field.classList.toggle("invalid", !!texto);
    document.getElementById(id).setAttribute("aria-invalid", texto ? "true" : "false");
  }

  function validar(d) {
    var ok = true, primero = null;
    function falla(id, t) { setError(id, t); ok = false; if (!primero) primero = id; }
    ["nombre", "apellido", "empresa", "area", "area_otra"].forEach(function (id) { setError(id, ""); });

    if (!d.nombre) falla("nombre", "Escribe tu nombre.");
    else if (!LETRAS.test(d.nombre)) falla("nombre", "Usa solo letras.");
    if (!d.apellido) falla("apellido", "Escribe tu apellido.");
    else if (!LETRAS.test(d.apellido)) falla("apellido", "Usa solo letras.");
    if (!d.empresa) falla("empresa", "Escribe el nombre de tu empresa.");
    if (!d.area) falla("area", "Selecciona tu área.");
    else if (d.area === "Otra" && !d.area_otra) falla("area_otra", "Escribe el nombre de tu área.");
    if (primero) document.getElementById(primero).focus();
    return ok;
  }

  function irAConfirmacion(d) {
    var q = new URLSearchParams({ n: d.nombre.split(" ")[0], e: d.empresa });
    window.location.href = "confirmacion.html?" + q.toString();
  }

  function enviar(d) {
    if (DEMO) return new Promise(function (r) { setTimeout(function () { r({ ok: true }); }, 600); });
    var ctrl = "AbortController" in window ? new AbortController() : null;
    var t = ctrl ? setTimeout(function () { ctrl.abort(); }, 20000) : null;
    // Sin encabezados personalizados: se envía como text/plain y evita la verificación CORS previa.
    return fetch(CFG.ENDPOINT, {
      method: "POST",
      body: JSON.stringify(d),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      if (t) clearTimeout(t);
      return r.json();
    });
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    msg.textContent = ""; msg.className = "form-msg";
    var d = {
      nombre: limpiar(form.nombre.value),
      apellido: limpiar(form.apellido.value),
      empresa: String(form.empresa.value || "").replace(/\s+/g, " ").trim(),
      area: area.value,
      area_otra: area.value === "Otra" ? limpiar(otra.value) : "",
      website: form.website.value, // trampa anti-bots: debe ir vacío
      origen: location.host || "local"
    };
    if (!validar(d)) return;

    btn.disabled = true;
    btn.textContent = "Confirmando…";
    enviar(d).then(function (res) {
      if (res && res.ok) { irAConfirmacion(d); return; }
      throw new Error((res && res.error) || "respuesta");
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = "Confirmar asistencia";
      msg.className = "form-msg error";
      msg.textContent = "No pudimos registrar tu asistencia. Revisa tu conexión e inténtalo de nuevo.";
    });
  });
})();
