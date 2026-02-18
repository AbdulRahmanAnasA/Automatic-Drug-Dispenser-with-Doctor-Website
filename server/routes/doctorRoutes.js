const express = require('express');
const router = express.Router();
const {
    loginDoctor,
    registerDoctor,
    getDoctors,
} = require('../controllers/doctorController');

router.post('/login', loginDoctor);
router.route('/').post(registerDoctor).get(getDoctors);

module.exports = router;
