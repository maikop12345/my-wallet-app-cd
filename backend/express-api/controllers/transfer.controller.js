// backend/express-api/controllers/transfer.controller.js
const { sequelize, User, Transfer } = require('../models');

exports.doTransfer = async (req, res) => {
  const fromPhone = req.user.phone;
  let { to: toPhone, amount } = req.body;

  // 1) Validar formato de toPhone
  if (!toPhone || !/^\d{10}$/.test(toPhone)) {
    return res
      .status(400)
      .json({ error: 'Número destino inválido (debe tener 10 dígitos).' });
  }
  if (toPhone === fromPhone) {
    return res
      .status(400)
      .json({ error: 'No puedes transferirte a ti mismo.' });
  }

  // 2) Validar que amount sea sólo dígitos y hasta 2 decimales
  const amountStr = String(amount);
  if (!/^\d+(\.\d{1,2})?$/.test(amountStr)) {
    return res
      .status(400)
      .json({ error: 'Monto inválido (solo números y hasta 2 decimales).' });
  }
  const amt = parseFloat(amountStr);
  if (amt <= 0) {
    return res
      .status(400)
      .json({ error: 'El monto debe ser mayor que cero.' });
  }

  try {
    // 3) Cargo ambos usuarios en paralelo
    const [fromUser, toUser] = await Promise.all([
      User.findByPk(fromPhone),
      User.findByPk(toPhone),
    ]);

    // 4) Verificar existencia usuario origen
    if (!fromUser) {
      return res
        .status(404)
        .json({ error: 'Usuario origen no encontrado.' });
    }

    // 5) Verificar existencia usuario destino, registrar fallo
    if (!toUser) {
      try {
        await Transfer.create({
          fromPhone,
          toPhone,
          amount: amt,
          status: 'failed',
          reason: 'Usuario destino no existe',
        });
      } catch (logErr) {
        console.error('No pude registrar transferencia fallida (destino no existe):', logErr);
      }
      return res
        .status(404)
        .json({ error: 'Usuario destino no encontrado.' });
    }

    // 6) Verificar saldo suficiente, registrar fallo
    if (fromUser.balance < amt) {
      await Transfer.create({
        fromPhone,
        toPhone,
        amount: amt,
        status: 'failed',
        reason: 'Saldo insuficiente',
      });
      return res
        .status(400)
        .json({ error: 'Saldo insuficiente.' });
    }

    // 7) Si todo OK, ejecutar transacción atómica
    const transaction = await sequelize.transaction();
    try {
      fromUser.balance -= amt;
      toUser.balance   += amt;

      await fromUser.save({ transaction });
      await toUser.save({ transaction });

      const record = await Transfer.create(
        {
          fromPhone,
          toPhone,
          amount: amt,
          status: 'success',
        },
        { transaction }
      );
      await transaction.commit();

      return res.json({
        success: true,
        newBalance: fromUser.balance,
        transfer: record,
      });
    } catch (err) {
      await transaction.rollback();
      console.error('Error en transacción:', err);
      return res
        .status(500)
        .json({ error: 'Error interno al procesar la transferencia.' });
    }
  } catch (err) {
    console.error('Error en doTransfer:', err);
    return res
      .status(500)
      .json({ error: 'Error interno en el servidor.' });
  }
};
