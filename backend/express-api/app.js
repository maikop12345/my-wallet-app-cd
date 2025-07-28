// backend/express-api/app.js
require('dotenv').config();   
const express      = require('express');
const cors         = require('cors');
const morgan       = require('morgan');
const jwt          = require('jsonwebtoken');
const swaggerUi    = require('swagger-ui-express');
const swaggerSpec  = require('./config/swagger');
const errorLogger    = require('./middlewares/errorLogger');
const healthRoutes   = require('./routes/health.routes');
const otpRoutes      = require('./routes/otp.routes');
const authRoutes     = require('./routes/auth.routes');
const balanceRoutes  = require('./routes/balance.routes');
const transferRoutes = require('./routes/transfer.routes');
const historyRoutes  = require('./routes/history.routes');

const app = express();

// 1) Middlewares básicos
app.use(cors());
app.use(express.json());

// 2) Logger HTTP
app.use(morgan('combined'));

// 3) Autenticación JWT global
app.use((req, res, next) => {
  // Rutas abiertas (no requieren token)
  const openPaths = ['/health', '/otp', '/login'];
  if (
    openPaths.includes(req.path) ||
    req.path.startsWith('/docs')
  ) {
    return next();
  }

  // Esperamos header "Authorization: Bearer <token>"
  const auth = req.headers.authorization?.split(' ');
  if (!auth || auth[0] !== 'Bearer' || !auth[1]) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    // Verificamos y decodificamos
    const payload = jwt.verify(auth[1], process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid or expired' });
  }
});

// 4) Swagger UI en /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 5) Montaje de rutas
app.use('/health',       healthRoutes);
app.use('/otp',          otpRoutes);
app.use('/login',        authRoutes);
app.use('/saldo',        balanceRoutes);
app.use('/transferir',   transferRoutes);
app.use('/transferencias', historyRoutes);
// 5) Logger de errores (por si cae un `throw` o next(err))
app.use(errorLogger);
module.exports = app;
