const asyncHandler = require('express-async-handler');
const Patient = require('../models/PatientModel');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
const getPatients = asyncHandler(async (req, res) => {
    const patients = await Patient.find({});
    res.json(patients);
});

// @desc    Get patient by RFID UID
// @route   GET /api/patients/:rfidUid
// @access  Private
const getPatientByRfid = asyncHandler(async (req, res) => {
    const patient = await Patient.findOne({ rfidUid: req.params.rfidUid });

    if (patient) {
        res.json(patient);
    } else {
        res.status(404);
        throw new Error('Patient not found');
    }
});

// @desc    Create a new patient
// @route   POST /api/patients
// @access  Private
const createPatient = asyncHandler(async (req, res) => {
     console.log("BODY FROM FRONTEND:", req.body);
    const { rfidUid, name, age, gender, condition } = req.body;

    const patientExists = await Patient.findOne({ rfidUid });

    if (patientExists) {
        res.status(400);
        throw new Error('Patient already exists');
    }

    const patient = await Patient.create({
        rfidUid,
        name,
        age,
        gender,
        condition,
    });

    if (patient) {
        res.status(201).json(patient);
    } else {
        res.status(400);
        throw new Error('Invalid patient data');
    }
});

// @desc    Update patient by RFID UID
// @route   PUT /api/patients/:rfidUid
// @access  Private
const updatePatient = asyncHandler(async (req, res) => {
    const { rfidUid } = req.params;
    const { name, age, gender, condition, status } = req.body;

    const patient = await Patient.findOne({ rfidUid });
    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }

    patient.name = name ?? patient.name;
    patient.age = age ?? patient.age;
    patient.gender = gender ?? patient.gender;
    patient.condition = condition ?? patient.condition;
    patient.status = status ?? patient.status;

    const updated = await patient.save();
    res.json(updated);
});

// @desc    Delete patient by RFID UID
// @route   DELETE /api/patients/:rfidUid
// @access  Private
const deletePatient = asyncHandler(async (req, res) => {
    const { rfidUid } = req.params;
    const patient = await Patient.findOne({ rfidUid });
    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }

    await patient.deleteOne();
    res.json({ message: 'Patient removed' });
});

module.exports = {
    getPatients,
    getPatientByRfid,
    createPatient,
    updatePatient,
    deletePatient,
};
