/**
 * HORIZONTE by PACS Computación — receptor de registros de asistencia.
 * Pegar en: Hoja de cálculo > Extensiones > Apps Script > Code.gs
 * Implementar como: Aplicación web · Ejecutar como: Yo · Quién tiene acceso: Cualquier persona
 */

const HOJA = 'Registros';
const ZONA = 'America/Mexico_City';
const AVISAR_A = ''; // Opcional: correo que recibe un aviso por cada registro (vacío = sin aviso)
const ENCABEZADOS = ['Fecha de registro', 'Nombre', 'Apellido', 'Empresa', 'Área', 'Área (otra)', 'Posible duplicado', 'Origen'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Trampa anti-bots: si el campo oculto trae algo, se responde OK sin guardar.
    if (d.website) return responder({ ok: true });

    const nombre = limpiar(d.nombre, 40);
    const apellido = limpiar(d.apellido, 40);
    const empresa = limpiar(d.empresa, 80);
    // Área admite varias opciones: llega como lista (areas) o como texto separado por comas (area).
    const lista = (Array.isArray(d.areas) ? d.areas : String(d.area || '').split(','))
      .map(function (a) { return limpiar(a, 40); })
      .filter(function (a, i, arr) { return a && arr.indexOf(a) === i; })
      .slice(0, 10);
    const area = lista.join(', ');
    const tieneOtra = lista.indexOf('Otra') > -1;
    const areaOtra = tieneOtra ? limpiar(d.area_otra, 60) : '';
    const origen = limpiar(d.origen, 80);

    if (!nombre || !apellido || !empresa || !area || (tieneOtra && !areaOtra)) {
      return responder({ ok: false, error: 'faltan_datos' });
    }

    const hoja = obtenerHoja();
    const clave = normalizar(nombre) + '|' + normalizar(apellido) + '|' + normalizar(empresa);
    let duplicado = false;
    const ultima = hoja.getLastRow();
    if (ultima > 1) {
      const filas = hoja.getRange(2, 2, ultima - 1, 3).getValues();
      duplicado = filas.some(function (f) {
        return normalizar(f[0]) + '|' + normalizar(f[1]) + '|' + normalizar(f[2]) === clave;
      });
    }

    hoja.appendRow([
      Utilities.formatDate(new Date(), ZONA, 'yyyy-MM-dd HH:mm:ss'),
      seguro(nombre), seguro(apellido), seguro(empresa), seguro(area), seguro(areaOtra),
      duplicado ? 'Sí' : 'No',
      seguro(origen)
    ]);

    if (AVISAR_A) {
      MailApp.sendEmail(AVISAR_A, 'HORIZONTE · Nuevo registro: ' + nombre + ' ' + apellido,
        nombre + ' ' + apellido + ' (' + empresa + ', ' + (areaOtra || area) + ') confirmó su asistencia.' +
        (duplicado ? '\nAviso: ya existía un registro con los mismos datos.' : ''));
    }
    return responder({ ok: true, duplicado: duplicado });
  } catch (err) {
    console.error(err);
    return responder({ ok: false, error: 'servidor' });
  } finally {
    lock.releaseLock();
  }
}

// Permite comprobar en el navegador que la implementación responde.
function doGet() {
  return responder({ ok: true, servicio: 'HORIZONTE · registro de asistencia' });
}

function obtenerHoja() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(HOJA);
  if (!hoja) hoja = libro.insertSheet(HOJA);
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(ENCABEZADOS);
    hoja.setFrozenRows(1);
    hoja.getRange(1, 1, 1, ENCABEZADOS.length).setFontWeight('bold').setBackground('#13203F').setFontColor('#FFFFFF');
  }
  return hoja;
}

function limpiar(v, max) {
  return String(v || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

// Evita que un texto que empiece con = + - @ se interprete como fórmula.
function seguro(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function normalizar(v) {
  return String(v || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Ejecutar una vez desde el editor (botón ▶) para autorizar permisos y crear la hoja "Registros".
function prueba() {
  const r = doPost({ postData: { contents: JSON.stringify({
    nombre: 'Prueba', apellido: 'Sistema', empresa: 'PACS Computación', areas: ['Tecnología / Sistemas', 'Otra'], area_otra: 'Innovación', origen: 'editor'
  }) } });
  console.log(r.getContent());
}