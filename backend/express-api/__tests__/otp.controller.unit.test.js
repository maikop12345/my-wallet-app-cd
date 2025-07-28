// backend/express-api/__tests__/otp.controller.unit.test.js
jest.mock('../models', () => ({
  User: {
    findByPk: jest.fn(),
  },
  Otp: {
    create: jest.fn(),
  },
}));

const { sendOtp } = require('../controllers/otp.controller');
const { User, Otp } = require('../models');

// 2) Helpers para simular req/res
function makeReq(body = {}) {
  return { body };
}
function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

describe('otp.controller.sendOtp (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('400 si phone inválido', async () => {
    const res1 = makeRes();
    await sendOtp(makeReq({ phone: '123' }), res1);
    expect(res1.status).toHaveBeenCalledWith(400);
    expect(res1.json).toHaveBeenCalledWith({ error: 'Número de celular inválido' });

    const res2 = makeRes();
    await sendOtp(makeReq({}), res2);
    expect(res2.status).toHaveBeenCalledWith(400);
  });

  it('404 si User.findByPk devuelve null', async () => {
    User.findByPk.mockResolvedValue(null);

    const res = makeRes();
    await sendOtp(makeReq({ phone: '3001234567' }), res);

    expect(User.findByPk).toHaveBeenCalledWith('3001234567');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no registrado' });
    // No debe llamar a Otp.create
    expect(Otp.create).not.toHaveBeenCalled();
  });

  it('500 si User.findByPk lanza error', async () => {
    User.findByPk.mockRejectedValue(new Error('DB caída'));

    const res = makeRes();
    await sendOtp(makeReq({ phone: '3001234567' }), res);

    expect(User.findByPk).toHaveBeenCalledWith('3001234567');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error interno al verificar usuario' });
    expect(Otp.create).not.toHaveBeenCalled();
  });

  it('200 crea OTP y devuelve success', async () => {
    // Fijamos Math.random para tener código predecible
    jest.spyOn(Math, 'random').mockReturnValue(0.5); // código = floor(100000+0.5*900000)=550000

    User.findByPk.mockResolvedValue({ phone: '3001234567' });

    const res = makeRes();
    await sendOtp(makeReq({ phone: '3001234567' }), res);

    // Verifica que buscó al usuario
    expect(User.findByPk).toHaveBeenCalledWith('3001234567');

    // Debe haber llamado a Otp.create con phone, code y expiresAt
    expect(Otp.create).toHaveBeenCalledTimes(1);
    const arg = Otp.create.mock.calls[0][0];
    expect(arg.phone).toBe('3001234567');
    // código de 6 dígitos
    expect(arg.code).toMatch(/^\d{6}$/);
    expect(arg.code).toBe('550000');
    expect(arg.expiresAt).toBeInstanceOf(Date);
    // Respuesta
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'OTP generado y enviado (válido 5 minutos)'
    });
  });
});
