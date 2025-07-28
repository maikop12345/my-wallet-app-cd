const jwt = require('jsonwebtoken');
const { User, Otp } = require('../models');
const { Op } = require('sequelize');

exports.login = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Faltan phone u otp' });
  }

  // Verificar OTP válido y no usado
  const record = await Otp.findOne({
    where: {
      phone,
      code: otp,
      expiresAt: { [Op.gt]: new Date() },
      used: false
    },
    order: [['createdAt', 'DESC']]
  });
  if (!record) {
    return res.status(401).json({ error: 'OTP incorrecto o expirado' });
  }
  // Marcar OTP como usado
  record.used = true;
  await record.save();

  // Crear usuario si no existe
  let user = await User.findByPk(phone);
  if (!user) {
    user = await User.create({ phone, balance: 0 });
  }
  // Actualizar último login
  user.lastLogin = new Date();
  await user.save();

  // Generar JWT
  const token = jwt.sign(
    { phone, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return res.json({ token });
};
