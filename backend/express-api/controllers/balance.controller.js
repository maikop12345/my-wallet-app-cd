// backend/express-api/controllers/balance.controller.js
const { User } = require('../models');

exports.getBalance = async (req, res) => {
  try {
    const phone = req.user.phone;
    const user = await User.findByPk(phone);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    return res.json({
      balance: user.balance,
      name:    user.name || 'Usuario'
    });
  } catch (err) {
    console.error('Error en getBalance:', err);
    return res.status(500).json({ error: 'Error al obtener el saldo' });
  }
};
