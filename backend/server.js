const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('../api/db.json'); // Pointe vers ton db.json existant
const middlewares = jsonServer.defaults();

// Active CORS pour toutes les routes
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  next();
});

// Utilise les middlewares par défaut
server.use(middlewares);

// Utilise le router
server.use(router);

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`JSON Server is running on port ${PORT}`);
});