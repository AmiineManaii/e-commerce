const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('../api/db.json');
const middlewares = jsonServer.defaults();

// Configuration CORS complète
server.use((req, res, next) => {
  // Autorise toutes les origines (ou spécifie ton domaine Netlify)
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 
    'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  // Répond aux pré-requêtes OPTIONS
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middlewares par défaut
server.use(middlewares);

// Router
server.use(router);

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`JSON Server is running on port ${PORT}`);
  console.log(`CORS enabled for all origins`);
});