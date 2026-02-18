const asyncHandler = require('express-async-handler');
const Prescription = require('../models/PrescriptionModel');
const Patient = require('../models/PatientModel');
const DispensingLog = require('../models/DispensingLogModel');
const Inventory = require('../models/InventoryModel');

// @desc    Get latest PENDING prescription by RFID UID
// @route   GET /api/prescriptions/:rfidUid
// @access  Private
const getPrescriptionByRfid = asyncHandler(async (req, res) => {
    // Find the latest prescription with status 'Pending'
    const prescription = await Prescription.findOne({
        rfidUid: req.params.rfidUid,
        status: 'Pending'
    }).sort({ createdAt: -1 });

    if (prescription) {
        res.json(prescription);
    } else {
        // No active prescription found
        res.status(404);
        throw new Error('No active prescription found');
    }
});

// Helper to reduce inventory for a medicine using only servos array
async function reduceInventory(inventory, medicine, qty) {
    if (!medicine || !qty || qty <= 0) return;
    if (Array.isArray(inventory.servos)) {
        const servo = inventory.servos.find(s =>
            typeof s.medicine === 'string' &&
            s.medicine.trim().toLowerCase() === medicine.trim().toLowerCase()
        );
        if (servo) {
            servo.stock = Math.max(0, servo.stock - qty);
        }
    }
}

// @desc    Create new prescription (always creates, never updates)
// @route   POST /api/prescriptions
// @access  Private
const updatePrescription = asyncHandler(async (req, res) => {
    const { rfidUid, paracetamol, azithromycin, revital, frequency, duration } = req.body;

    // Prevent duplicate pending prescription for same RFID
    const existingPending = await Prescription.findOne({ rfidUid, status: 'Pending' });
    if (existingPending) {
        return res.status(400).json({ errors: ['A pending prescription already exists for this patient.'], alerts: [] });
    }

    // Check inventory for refill alerts and zero-stock prevention
    const inventory = await Inventory.findOne();
    let alerts = [];
    let errors = [];

    function checkTablet(medicine, qty) {
        if (!medicine || !qty) return;
        const servo = inventory.servos.find(s =>
            typeof s.medicine === 'string' &&
            s.medicine.trim().toLowerCase() === medicine.trim().toLowerCase()
        );
        if (servo) {
            if (servo.stock === 0 && qty > 0) {
                errors.push(`${medicine} is out of stock and cannot be prescribed.`);
            } else {
                if (qty > servo.stock) {
                    errors.push(`Cannot prescribe ${qty} of ${medicine}. Only ${servo.stock} in stock.`);
                }
                if (servo.stock < 10) {
                    alerts.push(`Refill alert: ${medicine} stock is low (${servo.stock}).`);
                }
            }
        }
    }
    checkTablet('paracetamol', paracetamol);
    checkTablet('azithromycin', azithromycin);
    checkTablet('revital', revital);

    if (errors.length > 0) {
        return res.status(400).json({ errors, alerts });
    }

    // Reduce inventory for each medicine prescribed
    await reduceInventory(inventory, 'paracetamol', paracetamol);
    await reduceInventory(inventory, 'azithromycin', azithromycin);
    await reduceInventory(inventory, 'revital', revital);
    await inventory.save();

    // Always create a new prescription with status 'Pending'
    const newPrescription = await Prescription.create({
        rfidUid,
        paracetamol,
        azithromycin,
        revital,
        frequency,
        duration,
        status: 'Pending', // Explicitly set to Pending
    });

    res.status(201).json({ prescription: newPrescription, alerts });
});

// @desc    Dispense prescription (only if status is Pending)
// @route   POST /api/prescriptions/:rfidUid/dispense
// @access  Private
const dispensePrescription = asyncHandler(async (req, res) => {
    const { rfidUid } = req.params;

    // Find the latest prescription with status 'Pending'
    const prescription = await Prescription.findOne({
        rfidUid,
        status: 'Pending'
    }).sort({ createdAt: -1 });

    if (prescription) {
        prescription.status = 'Dispensed';
        prescription.lastDispensed = Date.now();
        const updatedPrescription = await prescription.save();

        // Resolve patient name (best-effort) and create a dispensing log for audit
        const patient = await Patient.findOne({ rfidUid });
        const patientName = patient ? patient.name : 'Unknown';

        try {
            await DispensingLog.create({
                rfidUid,
                patientName,
                medicines: {
                    paracetamol: prescription.paracetamol || 0,
                    azithromycin: prescription.azithromycin || 0,
                    revital: prescription.revital || 0,
                },
                status: 'Success',
            });
        } catch (err) {
            // don't block the main response — but surface a warning to logs
            console.warn('Failed to create dispensing log after dispense:', err.message || err);
        }

        res.json(updatedPrescription);
    } else {
        // Attempt to record a failure log (device may still report an attempt)
        const patient = await Patient.findOne({ rfidUid });
        const patientName = patient ? patient.name : 'Unknown';

        try {
            await DispensingLog.create({
                rfidUid,
                patientName,
                medicines: undefined,
                status: 'Failure',
                errorMessage: 'No active prescription found',
            });
        } catch (err) {
            console.warn('Failed to create failure dispensing log:', err.message || err);
        }

        res.status(404);
        throw new Error('No active prescription found');
    }
});

module.exports = {
    getPrescriptionByRfid,
    updatePrescription,
    dispensePrescription,
};
