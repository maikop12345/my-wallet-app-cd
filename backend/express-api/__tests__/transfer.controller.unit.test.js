// backend/express-api/__tests__/transfer.controller.unit.test.js

// 1) Mock de sequelize, User y Transfer
jest.mock('../models', () => {
  // Creamos un objeto de transacción simulado
  const fakeTransaction = {
    commit: jest.fn().mockResolvedValue(null),
    rollback: jest.fn().mockResolvedValue(null),
  };
  return {
    sequelize: {
      transaction: jest.fn().mockResolvedValue(fakeTransaction),
    },
    User: {
      findByPk: jest.fn(),
    },
    Transfer: {
      create: jest.fn(),
    },
  };
});

const { doTransfer } = require('../controllers/transfer.controller');
const { sequelize, User, Transfer } = require('../models');

// 2) Helpers para req/res
function makeReq(userPhone, body = {}) {
  return { user: { phone: userPhone }, body };
}
function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

describe('transfer.controller.doTransfer (unit)', () => {
  const fromPhone = '3001112222';
  const toPhone   = '3003334444';
  const validAmt  = '150.50';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('400 si número destino inválido', async () => {
    const res = makeRes();
    await doTransfer(makeReq(fromPhone, { to: '123', amount: validAmt }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Número destino inválido (debe tener 10 dígitos).'
    });
  });

  it('400 si intenta transferirse a sí mismo', async () => {
    const res = makeRes();
    await doTransfer(makeReq(fromPhone, { to: fromPhone, amount: validAmt }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'No puedes transferirte a ti mismo.'
    });
  });

  it('400 si monto con formato inválido', async () => {
    const res1 = makeRes();
    await doTransfer(makeReq(fromPhone, { to: toPhone, amount: 'abc' }), res1);
    expect(res1.status).toHaveBeenCalledWith(400);
    expect(res1.json).toHaveBeenCalledWith({
      error: 'Monto inválido (solo números y hasta 2 decimales).'
    });

    const res2 = makeRes();
    await doTransfer(makeReq(fromPhone, { to: toPhone, amount: '12.345' }), res2);
    expect(res2.status).toHaveBeenCalledWith(400);
  });

  it('400 si monto <= 0', async () => {
    const res = makeRes();
    await doTransfer(makeReq(fromPhone, { to: toPhone, amount: '0' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'El monto debe ser mayor que cero.'
    });
  });

  it('404 si usuario origen no existe', async () => {
    User.findByPk.mockResolvedValueOnce(null); // fromUser = null

    const res = makeRes();
    await doTransfer(makeReq(fromPhone, { to: toPhone, amount: validAmt }), res);

    expect(User.findByPk).toHaveBeenCalledWith(fromPhone);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Usuario origen no encontrado.'
    });
  });

  it('404 si usuario destino no existe y registra fallo', async () => {
    // fromUser existe, toUser no
    const fakeFrom = { balance: 1000 };
    User.findByPk
      .mockResolvedValueOnce(fakeFrom)   // find origin
      .mockResolvedValueOnce(null);      // find destination

    const res = makeRes();
    await doTransfer(makeReq(fromPhone, { to: toPhone, amount: validAmt }), res);

    // Debe haber registrado transferencia fallida
    expect(Transfer.create).toHaveBeenCalledWith({
      fromPhone,
      toPhone,
      amount: parseFloat(validAmt),
      status: 'failed',
      reason: 'Usuario destino no existe',
    });

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Usuario destino no encontrado.'
    });
  });

  it('400 si saldo insuficiente y registra fallo', async () => {
    // fromUser con saldo menor
    const fakeFrom = { balance: 10 };
    User.findByPk
      .mockResolvedValueOnce(fakeFrom)
      .mockResolvedValueOnce({}); // toUser sí existe

    const res = makeRes();
    await doTransfer(makeReq(fromPhone, { to: toPhone, amount: '100' }), res);

    expect(Transfer.create).toHaveBeenCalledWith({
      fromPhone,
      toPhone,
      amount: 100,
      status: 'failed',
      reason: 'Saldo insuficiente',
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Saldo insuficiente.'
    });
  });

  it('200 transacción exitosa y commit', async () => {
    // fromUser suficiente, toUser existe
    const fakeFrom = { balance: 200, save: jest.fn().mockResolvedValue(null) };
    const fakeTo   = { balance: 0,   save: jest.fn().mockResolvedValue(null) };
    const fakeRecord = { id: 1 };

    User.findByPk
      .mockResolvedValueOnce(fakeFrom)
      .mockResolvedValueOnce(fakeTo);
    Transfer.create.mockResolvedValue(fakeRecord);

    const res = makeRes();
    await doTransfer(makeReq(fromPhone, { to: toPhone, amount: '50' }), res);

    // Ajuste de saldos
    expect(fakeFrom.balance).toBe(150);
    expect(fakeTo.balance).toBe(50);
    // Guardado dentro de la transacción
    const tx = await sequelize.transaction();
    expect(fakeFrom.save).toHaveBeenCalledWith({ transaction: tx });
    expect(fakeTo.save).toHaveBeenCalledWith({ transaction: tx });
    // Registro exitoso
    expect(Transfer.create).toHaveBeenCalledWith({
      fromPhone,
      toPhone,
      amount: 50,
      status: 'success',
    }, { transaction: tx });

    // Commit y respuesta
    expect(tx.commit).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      newBalance: 150,
      transfer: fakeRecord,
    });
  });

  it('500 si falla el commit y hace rollback', async () => {
    // fromUser y toUser válidos
    const fakeFrom = { balance: 100, save: jest.fn().mockResolvedValue(null) };
    const fakeTo   = { balance: 0,   save: jest.fn().mockResolvedValue(null) };
    User.findByPk
      .mockResolvedValueOnce(fakeFrom)
      .mockResolvedValueOnce(fakeTo);

    // Forzamos error al crear el registro dentro de la transacción
    const tx = await sequelize.transaction();
    Transfer.create.mockRejectedValueOnce(new Error('DB write failed'));

    const res = makeRes();
    await doTransfer(makeReq(fromPhone, { to: toPhone, amount: '10' }), res);

    // Debe hacer rollback
    expect(tx.rollback).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Error interno al procesar la transferencia.'
    });
  });

  it('500 si hay un error inesperado fuera de la transacción', async () => {
    // Forzamos error en la carga de usuarios
    User.findByPk.mockRejectedValue(new Error('DB gone'));

    const res = makeRes();
    await doTransfer(makeReq(fromPhone, { to: toPhone, amount: '10' }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Error interno en el servidor.'
    });
  });
});
