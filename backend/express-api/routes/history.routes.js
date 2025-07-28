// backend/express-api/routes/history.routes.js
const router = require('express').Router();
const historyController = require('../controllers/history.controller');
const authenticate = require('../middlewares/auth');

/**
 * @openapi
 * /transferencias:
 *   get:
 *     summary: Obtener historial de transferencias
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de hasta 10 transferencias (recientes)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transfers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transfer'
 *       401:
 *         description: Token faltante o inválido
 *       500:
 *         description: Error interno
 */
router.get('/', authenticate, historyController.getHistory);

module.exports = router;
