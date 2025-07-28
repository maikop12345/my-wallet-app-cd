const { Sequelize, Op } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

const User = require('./user')(sequelize);
const Transfer = require('./transfer')(sequelize);
const Otp = require('./otp')(sequelize);

// Relaciones
User.hasMany(Transfer, { as: 'sent', foreignKey: 'fromPhone', sourceKey: 'phone' });
User.hasMany(Transfer, { as: 'received', foreignKey: 'toPhone', sourceKey: 'phone' });
Transfer.belongsTo(User, { as: 'sender', foreignKey: 'fromPhone', targetKey: 'phone' });
Transfer.belongsTo(User, { as: 'receiver', foreignKey: 'toPhone', targetKey: 'phone' });

module.exports = { sequelize, Sequelize, Op, User, Transfer, Otp };