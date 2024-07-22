const express = require('express');
const router = express.Router();
const { addUser } = require('../controllers/users.controller');
const { registerValidate } = require('../validators/users.validator');
const { validate } = require('../validators/validate');

router.post(
    '/register',
    [registerValidate, validate],
    addUser
);

module.exports = router;