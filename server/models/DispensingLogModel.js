const mongoose = require('mongoose');

const dispensingLogSchema = new mongoose.Schema({
    rfidUid: {
        type: String,
        required: true,
    },
    patientName: {
        type: String,
        required: true,
    },
    medicines: {
        paracetamol: { type: Number, default: 0 },
        azithromycin: { type: Number, default: 0 },
        revital: { type: Number, default: 0 },
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['Success', 'Failure', 'Pending'],
        required: true,
    },
    errorMessage: {
        type: String,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('DispensingLog', dispensingLogSchema);
