const express = require('express');
const router = express.Router();
const { getSectors } = require('../controllers/sectors.controller');

router.get(
    '/',
    getSectors
);

module.exports = router;