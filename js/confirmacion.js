(function () {
  "use strict";
  var CFG = window.HORIZONTE_CONFIG || {};
  var EV = CFG.EVENTO || {};
  var q = new URLSearchParams(location.search);
  var nombre = (q.get("n") || "").trim().slice(0, 40);
  var empresa = (q.get("e") || "").trim().slice(0, 80);

  if (nombre) {
    document.getElementById("gracias").textContent = "¡Gracias, " + nombre + "!";
    document.title = "¡Gracias, " + nombre + "! · HORIZONTE by PACS Computación";
  }
  var msg = document.getElementById("msg");
  if (empresa) {
    msg.textContent = "";
    msg.append("Tu asistencia en representación de ");
    var b = document.createElement("b");
    b.textContent = empresa;
    msg.append(b, " quedó confirmada.");
  }

  // Google Calendar
  var detalles = "Hoy celebramos lo construido. Visualizamos el horizonte contigo.";
  var g = new URLSearchParams({
    action: "TEMPLATE",
    text: EV.titulo || "HORIZONTE by PACS Computación",
    dates: (EV.inicioUTC || "") + "/" + (EV.finUTC || ""),
    location: EV.lugar || "",
    details: detalles
  });
  document.getElementById("gcal").href = "https://calendar.google.com/calendar/render?" + g.toString();

  // Archivo .ics (Apple Calendar / Outlook)
  var stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  var ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PACS Computacion//Horizonte//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:horizonte-2026-11-12@pacs",
    "DTSTAMP:" + stamp,
    "DTSTART:" + EV.inicioUTC,
    "DTEND:" + EV.finUTC,
    "SUMMARY:" + (EV.titulo || "HORIZONTE by PACS Computación"),
    "LOCATION:" + (EV.lugar || ""),
    "DESCRIPTION:" + detalles,
    "BEGIN:VALARM", "TRIGGER:-PT3H", "ACTION:DISPLAY", "DESCRIPTION:HORIZONTE by PACS Computación", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR"
  ].join("\r\n");
  document.getElementById("ics").href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);

  if (CFG.MAPS_URL) {
    var m = document.getElementById("mapa");
    m.href = CFG.MAPS_URL;
    m.hidden = false;
  }
})();
