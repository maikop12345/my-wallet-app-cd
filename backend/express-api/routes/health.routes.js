const router = require('express').Router();
const healthController = require('../controllers/health.controller');

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Healthcheck
 *     description: Devuelve el estado del servidor.
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', healthController.health);

module.exports = router;
