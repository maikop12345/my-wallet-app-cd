// backend/express-api/__tests__/balance.controller.unit.test.js

jest.mock('../models', () => ({
  User: {
    findByPk: jest.fn(),
  },
}));

const { getBalance } = require('../controllers/balance.controller');
const { User }       = require('../models');

// 2) Helpers para req/res
function makeReq(user) {
  return { user };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

describe('balance.controller.getBalance (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('200 devuelve balance y name cuando el usuario existe', async () => {
    // Simula usuario encontrado
    User.findByPk.mockResolvedValue({
      balance: 1234,
      name: 'María',
    });

    const req = makeReq({ phone: '3001234567' });
    const res = makeRes();

    await getBalance(req, res);

    expect(User.findByPk).toHaveBeenCalledWith('3001234567');
    expect(res.json).toHaveBeenCalledWith({
      balance: 1234,
      name:    'María',
    });
    expect(res.status).not.toHaveBeenCalled();
  });

  it('200 cuando no tiene name, usa "Usuario" por defecto', async () => {
    User.findByPk.mockResolvedValue({
      balance: 500,
      name:    null,
    });

    const req = makeReq({ phone: '3007654321' });
    const res = makeRes();

    await getBalance(req, res);

    expect(res.json).toHaveBeenCalledWith({
      balance: 500,
      name:    'Usuario',
    });
  });

  it('404 si User.findByPk devuelve null', async () => {
    User.findByPk.mockResolvedValue(null);

    const req = makeReq({ phone: '3000000000' });
    const res = makeRes();

    await getBalance(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
  });

  it('500 si ocurre un error inesperado', async () => {
    User.findByPk.mockRejectedValue(new Error('DB caída'));

    const req = makeReq({ phone: '3009999999' });
    const res = makeRes();

    await getBalance(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener el saldo' });
  });
});
