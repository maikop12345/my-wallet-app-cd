const router = require('express').Router();
const otpController = require('../controllers/otp.controller');

/**
 * @openapi
 * /otp:
 *   post:
 *     summary: Generar OTP
 *     description: Crea un código OTP de 6 dígitos y lo guarda en BD válido 5m
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: '3001234567'
 *     responses:
 *       200:
 *         description: OTP generado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP generado y enviado (válido 5 minutos)
 *       400:
 *         description: Número inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Número de celular inválido
 */
router.post('/', otpController.sendOtp);

module.exports = router;
