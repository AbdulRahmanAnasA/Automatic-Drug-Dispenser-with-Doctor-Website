const asyncHandler = require('express-async-handler');
const DispensingLog = require('../models/DispensingLogModel');

// @desc    Get all dispensing logs
// @route   GET /api/logs
// @access  Private
const getLogs = asyncHandler(async (req, res) => {
    const logs = await DispensingLog.find({}).sort({ timestamp: -1 });
    res.json(logs);
});

// @desc    Create a new dispensing log
// @route   POST /api/logs
// @access  Private (or from IoT device)
const createLog = asyncHandler(async (req, res) => {
    const { rfidUid, patientName, medicines, status, errorMessage } = req.body;

    const log = await DispensingLog.create({
        rfidUid,
        patientName,
        medicines,
        status,
        errorMessage,
    });

    if (log) {
        res.status(201).json(log);
    } else {
        res.status(400);
        throw new Error('Invalid log data');
    }
});

module.exports = {
    getLogs,
    createLog,
};
