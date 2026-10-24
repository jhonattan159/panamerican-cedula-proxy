/**
 * Proxy gratis para la consulta de cedula de la app web Panamerican.
 *
 * Por que existe: la pagina web (panamerican-app-ec.web.app) no puede llamar
 * directo a apicedula.socket-studio.com porque esa API no devuelve permisos
 * CORS y el navegador bloquea la llamada con "Failed to fetch". Este servicio
 * recibe la consulta desde la pagina (mismo origen permitido por CORS) y la
 * reenvia a socket-studio con el token del servidor.
 *
 * El token vive SOLO en la variable de entorno SOCKET_TOKEN de Render.
 * Nunca va en el codigo ni en el repositorio.
 */
const http = require("http");

const API_URL = "https://apicedula.socket-studio.com/consulta-cedula/consulta";
const ALLOWED_ORIGIN = "https://panamerican-app-ec.web.app";
const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  // CORS: solo la app web de Panamerican puede leer las respuestas.
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Accept");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, "http://localhost");
  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "panamerican-cedula-proxy" }));
    return;
  }

  const match = url.pathname.match(/^\/consulta-cedula\/(\d{10})\/?$/);
  if (req.method === "GET" && match) {
    const token = process.env.SOCKET_TOKEN;
    if (!token) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Token del servicio no configurado" }));
      return;
    }
    try {
      const apiRes = await fetch(`${API_URL}/${match[1]}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const text = await apiRes.text();
      res.writeHead(apiRes.status, { "Content-Type": "application/json" });
      res.end(text);
    } catch (err) {
      console.error("Error consultando socket-studio:", err.message);
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Fallo consultando el servicio de identidad" }));
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Ruta no encontrada" }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Proxy de cedula escuchando en puerto ${PORT}`);
});
