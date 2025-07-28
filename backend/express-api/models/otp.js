const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Otp', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    phone: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: { is: /^\d{10}$/ }
    },
    code: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'otps',
    timestamps: true,
    updatedAt: false
  });
};