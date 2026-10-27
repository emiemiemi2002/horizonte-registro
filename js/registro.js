(function () {
  "use strict";
  var CFG = window.HORIZONTE_CONFIG || {};
  var form = document.getElementById("registro");
  var btn = document.getElementById("enviar");
  var msg = document.getElementById("form-msg");
  var areaChecks = form.querySelectorAll('input[name="area"]');
  var otraCheck = document.getElementById("area-otra-check");
  var otraWrap = document.getElementById("otra-wrap");
  var otra = document.getElementById("area_otra");
  var DEMO = !CFG.ENDPOINT;

  if (DEMO) document.getElementById("demo").hidden = false;

  function areasSeleccionadas() {
    return Array.prototype.filter.call(areaChecks, function (c) { return c.checked; })
      .map(function (c) { return c.value; });
  }

  Array.prototype.forEach.call(areaChecks, function (c) {
    c.addEventListener("change", function () {
      setError("area", "");
      if (c === otraCheck) {
        otraWrap.hidden = !c.checked;
        otra.required = c.checked;
        if (c.checked) otra.focus();
        else { otra.value = ""; setError("area_otra", ""); }
      }
    });
  });

  // Al corregir un campo, se retira su mensaje de error.
  ["nombre", "apellido", "empresa", "area_otra"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () { setError(id, ""); });
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
    if (!d.areas.length) falla("area", "Selecciona al menos un área.");
    else if (d.areas.indexOf("Otra") > -1 && !d.area_otra) falla("area_otra", "Escribe el nombre de tu área.");
    if (primero) {
      var foco = primero === "area" ? areaChecks[0] : document.getElementById(primero);
      foco.focus();
    }
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
      areas: areasSeleccionadas(),
      area: "",
      area_otra: otraCheck.checked ? limpiar(otra.value) : "",
      website: form.website.value, // trampa anti-bots: debe ir vacío
      origen: location.host || "local"
    };
    d.area = d.areas.join(", ");
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
