const express = require('express');
const router = express.Router();
const {
    getPrescriptionByRfid,
    updatePrescription,
    dispensePrescription,
} = require('../controllers/prescriptionController');

router.route('/').post(updatePrescription);
router.route('/:rfidUid').get(getPrescriptionByRfid);
router.route('/:rfidUid/dispense').post(dispensePrescription);

module.exports = router;
