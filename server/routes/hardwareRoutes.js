const express = require('express');
const router = express.Router();
const {
    getPrescriptionForHardware,
    updateDispenseStatus
} = require('../controllers/hardwareController');

router.get('/:rfidUid', getPrescriptionForHardware);
router.put('/dispensed/:rfidUid', updateDispenseStatus);

module.exports = router;
