# HORIZONTE by PACS Computación · Registro de asistencia

Sitio estático (HTML, CSS y JS sin dependencias) con dos pantallas:

- `index.html`: formulario de registro (Nombre, Apellido, Empresa, Área).
- `confirmacion.html`: agradecimiento con nombre y empresa, fecha, lugar y hora, y botones para agregar el evento al calendario.

Los registros se guardan en Google Sheets mediante un Apps Script publicado como aplicación web (`apps-script/Code.gs`).

## 1. Conectar Google Sheets (≈10 min)

Recursos necesarios: una cuenta de Google (Gmail), una hoja de cálculo y el código de `apps-script/Code.gs`. No se requieren claves de API ni servidor.

1. En Google Drive crea una hoja de cálculo llamada **HORIZONTE · Registros**.
2. Abre **Extensiones › Apps Script**. Borra el contenido de `Código.gs` y pega todo el contenido de `apps-script/Code.gs`. Guarda.
3. En la barra superior elige la función **prueba** y presiona **Ejecutar**. Autoriza los permisos con tu cuenta. Si aparece “Google no ha verificado esta app”, entra a **Configuración avanzada › Ir a … (no seguro)**: el script es tuyo y solo escribe en esta hoja.
   Se creará la pestaña **Registros** con una fila de prueba (puedes borrarla después).
4. **Implementar › Nueva implementación** › tipo **Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
5. Copia la **URL de la aplicación web** (termina en `/exec`).
6. Opcional: para recibir un correo por cada registro, escribe tu correo en `AVISAR_A` antes de implementar.

> Si cambias el código después, usa **Implementar › Administrar implementaciones › Editar › Nueva versión** para conservar la misma URL.

## 2. Configurar el sitio

En `js/config.js` pega la URL en `ENDPOINT`. Opcional: agrega el enlace de Google Maps del lugar en `MAPS_URL` para mostrar el botón **Cómo llegar**.

Mientras `ENDPOINT` esté vacío, el sitio funciona en **modo de prueba** (muestra un aviso y no guarda datos).

## 3. Publicar en GitHub Pages

1. En GitHub crea un repositorio **público** llamado `horizonte-registro`.
2. **Add file › Upload files** y arrastra todo el contenido de esta carpeta (incluido `.nojekyll`). **Commit changes**.
3. **Settings › Pages** › Source: **Deploy from a branch** › Branch: `main` / `(root)` › **Save**.
4. En 1–2 minutos el sitio queda en `https://TU-USUARIO.github.io/horizonte-registro/`.
5. Para que la vista previa en WhatsApp muestre imagen, cambia en `index.html` la etiqueta `og:image` a la URL completa: `https://TU-USUARIO.github.io/horizonte-registro/assets/og.jpg`.

## 4. Prueba final

1. Abre la URL publicada, registra un dato de prueba y verifica que llegue a la hoja.
2. Abre la URL `/exec` en el navegador: debe responder `{"ok":true,...}`.

## Columnas de la hoja

Fecha de registro · Nombre · Apellido · Empresa · Área · Área (otra) · Posible duplicado · Origen

- **Posible duplicado = Sí** cuando ya existe un registro con el mismo nombre, apellido y empresa (sin distinguir mayúsculas ni acentos). Se guarda igual para no perder información.
- Los textos que empiezan con `=`, `+`, `-` o `@` se guardan como texto para evitar fórmulas inyectadas.
- El formulario incluye un campo oculto anti-bots: si un robot lo llena, el envío se descarta.

## Notas

- Logotipo HORIZONTE en azul marino (`assets/horizonte-navy.png`): se generó a partir de la versión blanca para fondo claro. Sustitúyelo por el archivo oficial si lo tienen.
- Tipografías Montserrat y Cormorant Garamond incluidas en `assets/fonts` (licencia SIL OFL).
- Horario para calendarios: 18:00–22:00 h (UTC-6). Ajusta `finUTC` en `js/config.js` si cambia.
