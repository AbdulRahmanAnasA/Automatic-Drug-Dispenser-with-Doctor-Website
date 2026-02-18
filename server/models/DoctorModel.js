const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ['Doctor', 'Admin'],
        default: 'Doctor',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Doctor', doctorSchema);
