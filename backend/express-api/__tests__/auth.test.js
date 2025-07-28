// backend/express-api/__tests__/login.unit.test.js

// 1) Mock de módulos externos
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fake-jwt-token'),
}));

jest.mock('../models', () => ({
  Otp: {
    findOne: jest.fn(),
  },
  User: {
    findByPk: jest.fn(),
    create: jest.fn(),
  },
}));

const { login } = require('../controllers/auth.controller'); // ajusta ruta si es necesario
const jwt      = require('jsonwebtoken');
const { Otp, User } = require('../models');

// 2) Helper para simular req/res
function makeReq(body = {}) {
  return { body };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

describe('auth.controller.login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('400 si faltan phone u otp', async () => {
    const res1 = makeRes();
    await login(makeReq({ phone: '123' }), res1);
    expect(res1.status).toHaveBeenCalledWith(400);
    expect(res1.json).toHaveBeenCalledWith({ error: 'Faltan phone u otp' });

    const res2 = makeRes();
    await login(makeReq({ otp: '654321' }), res2);
    expect(res2.status).toHaveBeenCalledWith(400);
  });

  test('401 si Otp.findOne devuelve null', async () => {
    Otp.findOne.mockResolvedValue(null);

    const res = makeRes();
    await login(makeReq({ phone: '3001234567', otp: '111111' }), res);

    expect(Otp.findOne).toHaveBeenCalledWith({
      where: expect.objectContaining({
        phone: '3001234567',
        code: '111111',
        used: false,
        expiresAt: expect.any(Object),
      }),
      order: [['createdAt', 'DESC']],
    });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'OTP incorrecto o expirado' });
  });

  test('200: marca OTP usado, crea usuario si no existe, genera JWT', async () => {
    // 1) Simular un record de OTP válido
    const fakeOtp = {
      used: false,
      save: jest.fn().mockResolvedValue(),
    };
    Otp.findOne.mockResolvedValue(fakeOtp);

    // 2) Simular que el usuario NO existe
    User.findByPk.mockResolvedValue(null);
    User.create.mockResolvedValue({
      phone: '3001234567',
      balance: 0,
      name: undefined,
      email: undefined,
      save: jest.fn().mockResolvedValue(),
    });

    const res = makeRes();
    await login(makeReq({ phone: '3001234567', otp: '222222' }), res);

    // Verificar que marcó OTP como usado y lo guardó
    expect(fakeOtp.used).toBe(true);
    expect(fakeOtp.save).toHaveBeenCalled();

    // Verificar que llamó a User.findByPk y como no existía, User.create
    expect(User.findByPk).toHaveBeenCalledWith('3001234567');
    expect(User.create).toHaveBeenCalledWith({ phone: '3001234567', balance: 0 });

    // Verificar que generó un token y lo devolvió
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '3001234567' }),
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    expect(res.json).toHaveBeenCalledWith({ token: 'fake-jwt-token' });
  });

  test('200: si el usuario ya existe, no lo crea de nuevo', async () => {
    const fakeOtp = {
      used: false,
      save: jest.fn().mockResolvedValue(),
    };
    Otp.findOne.mockResolvedValue(fakeOtp);

    // Simular usuario existente
    const existingUser = {
      phone: '3001234567',
      balance: 50,
      name: 'Juan',
      email: 'juan@example.com',
      save: jest.fn().mockResolvedValue(),
    };
    User.findByPk.mockResolvedValue(existingUser);

    const res = makeRes();
    await login(makeReq({ phone: '3001234567', otp: '333333' }), res);

    // No debe crear usuario
    expect(User.create).not.toHaveBeenCalled();

    // Debe actualizar lastLogin y guardar
    expect(existingUser.lastLogin).toBeInstanceOf(Date);
    expect(existingUser.save).toHaveBeenCalled();

    // Debe devolver token
    expect(res.json).toHaveBeenCalledWith({ token: 'fake-jwt-token' });
  });
});
