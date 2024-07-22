const express = require('express');
const router = express.Router();
const { addUser } = require('../controllers/users.controller');

router.post(
    '/register',
    [],
    addUser
);

module.exports = router;