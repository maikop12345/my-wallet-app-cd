const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Transfer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fromPhone: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    toPhone: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('success', 'failed'),
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'transfers',
    timestamps: true,
  });
};
