// seed.js
require('dotenv').config();
const { sequelize, User } = require('./models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('BD conectada');

    // Datos de ejemplo
    const initialUsers = [
      { phone: '3001234567', name: 'Usuario A', email: 'a@example.com', balance: 100000 },
      { phone: '3007654321', name: 'Usuario B', email: 'b@example.com', balance: 20000 },
      { phone: '3203858243', name: 'Usuario C', email: 'c@example.com', balance: 2000000 },
    ];

    for (const u of initialUsers) {
      const [user, created] = await User.findOrCreate({
        where: { phone: u.phone },
        defaults: u
      });
      console.log(`${created ? 'Creado' : 'Ya existía'} usuario ${user.phone}`);
    }

    console.log('Seed completado');
    process.exit(0);
  } catch (err) {
    console.error('Error en seed:', err);
    process.exit(1);
  }
})();
