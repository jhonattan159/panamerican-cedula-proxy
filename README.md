# Proxy de cédula — app web Panamerican

Servicio gratuito en Render (free tier) que hace de intermediario entre la
página web de Contratos de Panamerican y la API de socket-studio.

**Por qué existe:** la API no devuelve permisos CORS, así que el navegador
bloquea la llamada directa con "Failed to fetch". Este proxy recibe la
consulta desde la página y la reenvía con el token del servidor.

**Despliegue en Render:** Web Service gratuito, runtime Node, build `npm install`,
start `node server.js`. Variable de entorno obligatoria: `SOCKET_TOKEN`
(el token de socket-studio; se define en el dashboard de Render, nunca aquí).

**Endpoints:**
- `GET /` → salud del servicio.
- `GET /consulta-cedula/<10 dígitos>` → JSON de la API (o `null` si no existe).

Solo el origen `https://panamerican-app-ec.web.app` puede leer las respuestas.
