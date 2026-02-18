const asyncHandler = require('express-async-handler');
const Doctor = require('../models/DoctorModel');

// @desc    Auth doctor & get token (Login)
// @route   POST /api/doctors/login
// @access  Public
const loginDoctor = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    // TODO: Implement actual authentication logic (password hashing, JWT)
    // For now, just a placeholder that checks if user exists

    const doctor = await Doctor.findOne({ username });

    if (doctor) {
        res.json({
            _id: doctor.id,
            name: doctor.name,
            username: doctor.username,
            role: doctor.role,
            token: 'dummy-token', // TODO: Generate valid JWT
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Register a new doctor
// @route   POST /api/doctors
// @access  Public
const registerDoctor = asyncHandler(async (req, res) => {
    const { name, username } = req.body;

    const doctorExists = await Doctor.findOne({ username });

    if (doctorExists) {
        res.status(400);
        throw new Error('Doctor already exists');
    }

    const doctor = await Doctor.create({
        name,
        username,
    });

    if (doctor) {
        res.status(201).json({
            _id: doctor.id,
            name: doctor.name,
            username: doctor.username,
            role: doctor.role,
            token: 'dummy-token',
        });
    } else {
        res.status(400);
        throw new Error('Invalid doctor data');
    }
});

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private/Admin
const getDoctors = asyncHandler(async (req, res) => {
    const doctors = await Doctor.find({});
    res.json(doctors);
});

module.exports = {
    loginDoctor,
    registerDoctor,
    getDoctors,
};
