// backend/express-api/controllers/history.controller.js
const { Transfer } = require('../models');
const { Op } = require('sequelize');

exports.getHistory = async (req, res) => {
  try {
    const phone    = req.user.phone;
    const page     = Math.max(Number(req.query.page)     || 1, 1);
    const pageSize = Math.min(Number(req.query.pageSize) || 10, 50);

    const offset = (page - 1) * pageSize;

    // findAndCountAll para paginar y contar total
    const { rows: transfers, count: totalCount } = await Transfer.findAndCountAll({
      where: {
        [Op.or]: [
          { fromPhone: phone },
          { toPhone:   phone }
        ]
      },
      order: [['createdAt', 'DESC']],
      limit:  pageSize,
      offset: offset
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return res.json({
      transfers,
      pagination: { page, pageSize, totalPages, totalCount }
    });
  } catch (err) {
    console.error('Error en getHistory:', err);
    return res.status(500).json({ error: 'Error al obtener historial' });
  }
};
