const jsonServer = require('json-server');
const path = require('path');
const server = jsonServer.create();
// En dev comme en prod : chemin absolu robuste vers db.json
const dbPath = path.join(__dirname, '..', 'api', 'db.json');
const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();

// Configuration CORS complète
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middlewares par défaut
server.use(middlewares);

// Compatibilité avec l'ancien front Spring Boot (évite les 404 en dev) :
// /games/promo -> /games?promo=true , /games/popular -> /games?popular=true
// /cart/user/:id -> /cart?userId=:id , /cart/session/:sid -> /cart?sessionId=:sid
// /addresses/user/:id -> /addresses?userId=:id , /orders/user/:id -> /orders?userId=:id
// /reviews/game/:id -> /reviews?gameId=:id , /reviews/user/:id -> /reviews?userId=:id
// /users/email/:email -> /users?email=:email
server.use((req, res, next) => {
  const rewrites = [
    [/^\/games\/promo$/, '/games?promo=true'],
    [/^\/games\/popular$/, '/games?popular=true'],
    [/^\/cart\/user\/(.+)$/, '/cart?userId=$1'],
    [/^\/cart\/session\/(.+)$/, '/cart?sessionId=$1'],
    [/^\/addresses\/user\/(.+)$/, '/addresses?userId=$1'],
    [/^\/orders\/user\/(.+)$/, '/orders?userId=$1'],
    [/^\/reviews\/game\/(.+)$/, '/reviews?gameId=$1'],
    [/^\/reviews\/user\/(.+)$/, '/reviews?userId=$1'],
    [/^\/users\/email\/(.+)$/, '/users?email=$1'],
  ];
  for (const [pattern, target] of rewrites) {
    const m = req.url.match(pattern);
    if (m) {
      req.url = target.replace(/\$1/g, m[1]);
      break;
    }
  }
  next();
});

// Router
server.use(router);

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`JSON Server is running on port ${PORT} (db: ${dbPath})`);
  console.log(`CORS enabled for all origins`);
});
