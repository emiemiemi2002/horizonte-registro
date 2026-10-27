/*
 * Configuración del registro HORIZONTE.
 * ENDPOINT: pega aquí la URL que termina en /exec de la implementación del Apps Script.
 * Si se deja vacío, el sitio funciona en modo de prueba (no guarda registros).
 */
window.HORIZONTE_CONFIG = {
  ENDPOINT: "https://script.google.com/macros/s/AKfycbw9_3eM2tMgTT7XhuEYUk46VuTyfz20tICHOPs2lszgtcDk7lTg4kr7EJB3aOGf_Vby/exec",

  EVENTO: {
    titulo: "HORIZONTE by PACS Computación",
    fechaTexto: "12 de noviembre de 2026",
    horaTexto: "6:00 PM",
    lugar: "Jardín del Real del Campanario",
    // Horario para calendarios, en UTC (Durango/CDMX = UTC-6 todo el año).
    inicioUTC: "20261113T000000Z", // 12 nov 2026, 18:00 h
    finUTC: "20261113T040000Z"     // 12 nov 2026, 22:00 h (ajustar si cambia)
  },

  // Enlace de Google Maps del lugar. Si queda vacío, no se muestra el botón "Cómo llegar".
  MAPS_URL: "https://maps.app.goo.gl/aBQbBLVpQCzKxh9VA"
};
