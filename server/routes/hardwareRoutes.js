const express = require('express');
const router = express.Router();
const { getPrescriptionForHardware } = require('../controllers/hardwareController');

router.get('/:rfidUid', getPrescriptionForHardware);

module.exports = router;
