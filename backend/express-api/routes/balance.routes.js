// backend/express-api/routes/balance.routes.js
const router = require('express').Router();
const balanceController = require('../controllers/balance.controller');
const authenticate = require('../middlewares/auth');

/**
 * @openapi
 * /saldo:
 *   get:
 *     summary: Obtener saldo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saldo disponible del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: integer
 *                   example: 100000
 *       401:
 *         description: Token faltante o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authenticate, balanceController.getBalance);

module.exports = router;
