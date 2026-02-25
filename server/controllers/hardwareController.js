const asyncHandler = require('express-async-handler');
const Prescription = require('../models/PrescriptionModel');
const Patient = require('../models/PatientModel');

// @desc    Get latest PENDING prescription by RFID UID including patient name for hardware
// @route   GET /api/hardware/:rfidUid
// @access  Public (Hardware access)
const getPrescriptionForHardware = asyncHandler(async (req, res) => {
    const { rfidUid } = req.params;

    // Find the latest prescription with status 'Pending'
    const prescription = await Prescription.findOne({
        rfidUid,
        status: 'Pending'
    }).sort({ createdAt: -1 });

    if (prescription) {
        // Fetch patient name
        const patient = await Patient.findOne({ rfidUid });
        const patientName = patient ? patient.name : 'Unknown Patient';

        // Format response for hardware (ESP32)
        res.json({
            rfidUid: prescription.rfidUid,
            patientName: patientName,
            paracetamol: prescription.paracetamol || 0,
            azithromycin: prescription.azithromycin || 0,
            revital: prescription.revital || 0,
            frequency: prescription.frequency,
            duration: prescription.duration,
            status: prescription.status,
            createdAt: prescription.createdAt
        });
    } else {
        res.status(404);
        throw new Error('No pending prescription found for this RFID');
    }
});

// @desc    Update prescription status to 'Dispensed' by RFID
// @route   PUT /api/hardware/dispensed/:rfidUid
// @access  Public (Hardware access)
const updateDispenseStatus = asyncHandler(async (req, res) => {
    const { rfidUid } = req.params;

    // Find the latest prescription with status 'Pending'
    const prescription = await Prescription.findOne({
        rfidUid,
        status: 'Pending'
    }).sort({ createdAt: -1 });

    if (prescription) {
        prescription.status = 'Dispensed';
        prescription.lastDispensed = new Date();
        await prescription.save();

        res.json({
            message: 'Prescription marked as dispensed',
            rfidUid: prescription.rfidUid,
            status: prescription.status,
            lastDispensed: prescription.lastDispensed
        });
    } else {
        res.status(404);
        throw new Error('No pending prescription found for this RFID to update');
    }
});

module.exports = {
    getPrescriptionForHardware,
    updateDispenseStatus,
};
