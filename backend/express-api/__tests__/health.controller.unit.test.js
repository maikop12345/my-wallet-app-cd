// backend/express-api/__tests__/health.controller.unit.test.js

// 1) Importamos sólo la función a testear
const { health } = require('../controllers/health.controller');

// 2) Helper para simular res de Express
function makeRes() {
  const res = {};
  res.json   = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
}

describe('health.controller.health (unit)', () => {
  it('debe responder JSON { status: "ok" } sin errores', () => {
    const req = {};
    const res = makeRes();

    health(req, res);

    // Nunca establece código distinto, así que no debe llamarse status()
    expect(res.status).not.toHaveBeenCalled();

    // Debe devolver el objeto esperado
    expect(res.json).toHaveBeenCalledWith({ status: 'ok' });
  });
});
