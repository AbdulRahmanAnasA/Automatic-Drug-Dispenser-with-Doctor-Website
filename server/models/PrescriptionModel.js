const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    rfidUid: {
        type: String,
        required: true,
        ref: 'Patient', // Assuming rfidUid links to Patient, though typically references use _id. Keeping string to match client type.
    },
    paracetamol: {
        type: Number,
        default: 0,
    },
    azithromycin: {
        type: Number,
        default: 0,
    },
    revital: {
        type: Number,
        default: 0,
    },
    frequency: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Dispensed'],
        default: 'Pending',
    },
    lastDispensed: {
        type: Date,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
