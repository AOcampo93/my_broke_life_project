// routes/swagger.js
//
// Expose the Swagger UI at /api-docs. This route serves the Swagger
// specification defined in the project's swagger.json file. To
// generate a new version of the spec edit swagger.json. The host and
// schemes values are adjusted dynamically based on the incoming
// request so that the documentation works both locally and when
// deployed to Render or other providers.

const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const rawSpec = require('../swagger.json');

// Serve Swagger UI assets
router.use('/api-docs', swaggerUi.serve);

// Apply dynamic host and scheme so the docs function regardless of
// environment (http in local dev, https on Render)
router.use('/api-docs', (req, res, next) => {
  const spec = JSON.parse(JSON.stringify(rawSpec));
  const host = req.get('host');
  const forwardedProto = (req.headers['x-forwarded-proto'] || '').split(',')[0];
  const protoRaw = forwardedProto || req.protocol || 'https';
  const proto = protoRaw === 'http' && host && host.endsWith('onrender.com') ? 'https' : protoRaw;
  spec.host = host;
  spec.schemes = [proto];
  return swaggerUi.setup(spec)(req, res, next);
});

module.exports = router;