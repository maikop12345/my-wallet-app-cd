// backend/express-api/__tests__/history.controller.unit.test.js

jest.mock('../models', () => ({
  Transfer: {
    findAndCountAll: jest.fn(),
  },
}));

const { getHistory } = require('../controllers/history.controller');
const { Transfer }   = require('../models');

// 2) Helpers para simular req/res de Express
function makeReq({ phone, page, pageSize } = {}) {
  return {
    user: { phone },
    query: { page, pageSize },
  };
}

function makeRes() {
  const res = {};
  res.json   = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
}

describe('history.controller.getHistory (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('200 retorna transfers y paginación con valores por defecto', async () => {
  // Simulamos 3 transferencias y un total de 3
  const fakeRows = [
    { id: 1, fromPhone: 'A', toPhone: 'B', amount: 100, createdAt: '2025-07-28' },
    { id: 2, fromPhone: 'A', toPhone: 'C', amount: 200, createdAt: '2025-07-27' },
    { id: 3, fromPhone: 'D', toPhone: 'A', amount: 300, createdAt: '2025-07-26' },
  ];
  Transfer.findAndCountAll.mockResolvedValue({
    rows: fakeRows,
    count: 3,
  });

  const req = makeReq({ phone: 'A' });
  const res = makeRes();

  await getHistory(req, res);

  // Extraemos el primer (y único) argumento con el que fue llamado
  const callArg = Transfer.findAndCountAll.mock.calls[0][0];

  // Verificamos limit, offset y order
  expect(callArg.limit).toBe(10);
  expect(callArg.offset).toBe(0);
  expect(callArg.order).toEqual([['createdAt', 'DESC']]);

  // Y comprobamos que bajo la clave Op.or estén nuestros filtros
  const { Op } = require('sequelize');
  expect(callArg.where[Op.or]).toEqual([
    { fromPhone: 'A' },
    { toPhone:   'A' },
  ]);

  // Finalmente, la respuesta JSON
  expect(res.json).toHaveBeenCalledWith({
    transfers: fakeRows,
    pagination: {
      page: 1,
      pageSize: 10,
      totalCount: 3,
      totalPages: 1,
    }
  });
});

  it('200 respeta parámetros de página y tamaño, y los recorta correctamente', async () => {
    // Supongamos un total de 45 items
    const rows = Array(5).fill({}).map((_,i)=>({id:i}));
    Transfer.findAndCountAll.mockResolvedValue({
      rows,
      count: 45,
    });

    // página 2, pageSize 20
    const req = makeReq({ phone: 'X', page: '2', pageSize: '20' });
    const res = makeRes();

    await getHistory(req, res);

    // offset = (2-1)*20 = 20
    expect(Transfer.findAndCountAll).toHaveBeenCalledWith({
      where: expect.any(Object),
      order: [['createdAt', 'DESC']],
      limit:  20,
      offset: 20,
    });

    expect(res.json).toHaveBeenCalledWith({
      transfers: rows,
      pagination: {
        page: 2,
        pageSize: 20,
        totalCount: 45,
        totalPages: Math.ceil(45/20), // =3
      }
    });
  });

  it('ajusta page = 1 si viene <1, y pageSize <=50', async () => {
    const rows = [];
    Transfer.findAndCountAll.mockResolvedValue({ rows, count: 0 });

    // página negativa y pageSize muy grande
    const req = makeReq({ phone: 'X', page: '-5', pageSize: '1000' });
    const res = makeRes();

    await getHistory(req, res);

    // debería usar page=1, pageSize=50
    expect(Transfer.findAndCountAll).toHaveBeenCalledWith({
      where: expect.any(Object),
      order: [['createdAt', 'DESC']],
      limit:  50,
      offset: 0,
    });
    expect(res.json).toHaveBeenCalledWith({
      transfers: rows,
      pagination: {
        page: 1,
        pageSize: 50,
        totalCount: 0,
        totalPages: 0,
      }
    });
  });

  it('500 si Transfer.findAndCountAll lanza error', async () => {
    Transfer.findAndCountAll.mockRejectedValue(new Error('DB caida'));

    const req = makeReq({ phone: 'Z' });
    const res = makeRes();

    await getHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener historial' });
  });
});
