const express = require('express');
const router = express.Router();
const {
    getInventory,
    updateInventory,
    addServo,
    updateServo,
    removeServo,
} = require('../controllers/inventoryController');

router.route('/').get(getInventory);
router.route('/update').post(updateInventory);

// Per-servo operations
router.route('/servos').post(addServo);
router.route('/servos/:index').put(updateServo).delete(removeServo);

module.exports = router;
