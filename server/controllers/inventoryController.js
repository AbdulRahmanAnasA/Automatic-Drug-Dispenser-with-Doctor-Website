const asyncHandler = require('express-async-handler');
const Inventory = require('../models/InventoryModel');

const MAX_SERVOS = 12;

function normalizeServoInput(s) {
    return {
        medicine: s.medicine || 'Unknown',
        stock: Math.max(0, Number(s.stock || 0)),
        max: Math.max(1, Number(s.max || 100)),
    };
}

// migrate legacy servo1/2/3 into servos array
async function ensureServosArray(inventory) {
    if (!inventory) return inventory;
    if (inventory.servos && inventory.servos.length) return inventory;

    const servos = [];
    ['servo1', 'servo2', 'servo3'].forEach((k, i) => {
        if (inventory[k]) {
            servos.push({ slot: i + 1, medicine: inventory[k].medicine, stock: inventory[k].stock, max: inventory[k].max });
        }
    });

    // If none exist, seed defaults
    if (servos.length === 0) {
        servos.push({ slot: 1, medicine: 'Paracetamol', stock: 100, max: 100 });
        servos.push({ slot: 2, medicine: 'Azithromycin', stock: 100, max: 100 });
        servos.push({ slot: 3, medicine: 'Revital', stock: 100, max: 100 });
    }

    inventory.servos = servos;
    await inventory.save();
    return inventory;
}

// @desc    Get inventory status
// @route   GET /api/inventory
// @access  Private
const getInventory = asyncHandler(async (req, res) => {
    // single document for global inventory
    let inventory = await Inventory.findOne();

    if (!inventory) {
        inventory = await Inventory.create({
            servo1: { medicine: 'Paracetamol', stock: 100, max: 100 },
            servo2: { medicine: 'Azithromycin', stock: 100, max: 100 },
            servo3: { medicine: 'Revital', stock: 100, max: 100 },
        });
    }

    inventory = await ensureServosArray(inventory);
    res.json(inventory);
});

// @desc    Update inventory (bulk)
// @route   POST /api/inventory/update
// @access  Private
const updateInventory = asyncHandler(async (req, res) => {
    const { servo1, servo2, servo3 } = req.body;

    let inventory = await Inventory.findOne();

    if (inventory) {
        if (servo1) inventory.servo1 = { ...inventory.servo1, ...servo1 };
        if (servo2) inventory.servo2 = { ...inventory.servo2, ...servo2 };
        if (servo3) inventory.servo3 = { ...inventory.servo3, ...servo3 };

        const updatedInventory = await inventory.save();
        res.json(updatedInventory);
    } else {
        res.status(404);
        throw new Error('Inventory not found');
    }
});

// @desc    Add a servo
// @route   POST /api/inventory/servos
// @access  Private
const addServo = asyncHandler(async (req, res) => {
    const { medicine, stock = 0, max = 100 } = req.body;
    const inventory = await Inventory.findOne();
    if (!inventory) {
        res.status(404);
        throw new Error('Inventory not found');
    }
    if (!inventory.servos) inventory.servos = [];
    if (inventory.servos.length >= MAX_SERVOS) {
        res.status(400);
        throw new Error(`Max servos is ${MAX_SERVOS}`);
    }
    const servo = { slot: inventory.servos.length + 1, medicine, stock: Math.max(0, stock), max: Math.max(1, max) };
    inventory.servos.push(servo);
    await inventory.save();
    res.status(201).json(inventory);
});

// @desc    Update a specific servo by index
// @route   PUT /api/inventory/servos/:index
// @access  Private
const updateServo = asyncHandler(async (req, res) => {
    const idx = Number(req.params.index);
    const { medicine, stock, max } = req.body;
    const inventory = await Inventory.findOne();
    if (!inventory || !inventory.servos || !inventory.servos[idx]) {
        res.status(404);
        throw new Error('Servo not found');
    }
    const servo = inventory.servos[idx];
    if (medicine !== undefined) servo.medicine = medicine;
    if (stock !== undefined) servo.stock = Math.max(0, Number(stock));
    if (max !== undefined) servo.max = Math.max(1, Number(max));
    // enforce stock <= max
    if (servo.stock > servo.max) servo.stock = servo.max;
    inventory.servos[idx] = servo;
    await inventory.save();
    res.json(inventory);
});

// @desc    Remove a servo by index
// @route   DELETE /api/inventory/servos/:index
// @access  Private
const removeServo = asyncHandler(async (req, res) => {
    const idx = Number(req.params.index);
    const inventory = await Inventory.findOne();
    if (!inventory || !inventory.servos || !inventory.servos[idx]) {
        res.status(404);
        throw new Error('Servo not found');
    }
    inventory.servos.splice(idx, 1);
    // re-slot remaining
    inventory.servos = inventory.servos.map((s, i) => ({ ...s, slot: i + 1 }));
    await inventory.save();
    res.json(inventory);
});

module.exports = {
    getInventory,
    updateInventory,
    addServo,
    updateServo,
    removeServo,
};
