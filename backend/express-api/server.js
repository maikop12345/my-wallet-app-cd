require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./config/database');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('DB conectada y tablas sincronizadas');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server escuchando en http://localhost:${PORT}`));
  } catch (err) {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
})();
