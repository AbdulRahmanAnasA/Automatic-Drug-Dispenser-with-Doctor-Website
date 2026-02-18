const express = require('express');
const router = express.Router();
const {
    getPatients,
    getPatientByRfid,
    createPatient,
    updatePatient,
    deletePatient,
} = require('../controllers/patientController');

router.route('/').get(getPatients).post(createPatient);
router.route('/:rfidUid').get(getPatientByRfid).put(updatePatient).delete(deletePatient);

module.exports = router;
