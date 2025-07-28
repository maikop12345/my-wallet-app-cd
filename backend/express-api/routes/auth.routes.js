const router = require('express').Router();
const authController = require('../controllers/auth.controller');

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Login con OTP
 *     description: Valida OTP y emite JWT válido por 1 hora.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, otp]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: '3001234567'
 *               otp:
 *                 type: string
 *                 example: '123456'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Falta phone u otp
 *       401:
 *         description: OTP inválido o expirado
 */
router.post('/', authController.login);

module.exports = router;
