const express = require('express');
const router = express.Router();
const {
    getLogs,
    createLog,
} = require('../controllers/logController');

router.route('/').get(getLogs).post(createLog);

module.exports = router;
