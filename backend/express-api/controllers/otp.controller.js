// backend/express-api/controllers/otp.controller.js
const { User,Otp } = require('../models');

/**
 * Genera y guarda un OTP de 6 dígitos, válido 5 minutos.
 */
exports.sendOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone || !/^\d{10}$/.test(phone)) {
    return res.status(400).json({ error: 'Número de celular inválido' });
  }
  // 2) Comprobar que el usuario existe en la tabla users
  try {
    const user = await User.findByPk(phone);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no registrado' });
    }
  } catch (dbErr) {
    console.error('Error consultando usuario:', dbErr);
    return res.status(500).json({ error: 'Error interno al verificar usuario' });
  }
  // Generar código aleatorio de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Guardar en DB
  await Otp.create({ phone, code, expiresAt });

  // Simular envío (puede integrarse SMS aquí)
  console.log(`OTP enviado a ${phone}: ${code}`);

  return res.json({
    success: true,
    message: 'OTP generado y enviado (válido 5 minutos)'
  });
};
