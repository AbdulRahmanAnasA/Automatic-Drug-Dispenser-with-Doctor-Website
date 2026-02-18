const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    medicine: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    max: { type: Number, required: true, default: 100 },
}, { _id: false });

const inventorySchema = new mongoose.Schema({
    // Only use dynamic servos array for all slots/medicines
    servos: [{
        slot: { type: Number },
        medicine: { type: String, required: true },
        stock: { type: Number, required: true, default: 0 },
        max: { type: Number, required: true, default: 100 },
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Inventory', inventorySchema);
