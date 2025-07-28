// backend/express-api/routes/transfer.routes.js
const router = require('express').Router();
const transferController = require('../controllers/transfer.controller');
const authenticate = require('../middlewares/auth');

/**
 * @openapi
 * /transferir:
 *   post:
 *     summary: Transferir dinero
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [to, amount]
 *             properties:
 *               to:
 *                 type: string
 *                 example: '3007654321'
 *               amount:
 *                 type: integer
 *                 example: 15500
 *     responses:
 *       200:
 *         description: Transferencia exitosa
 *       400:
 *         description: Validaciones fallidas
 *       404:
 *         description: Usuario destino no existe
 *       401:
 *         description: Token faltante o inválido
 */
router.post('/', authenticate, transferController.doTransfer);

module.exports = router;
