const express = require('express');
const router = express.Router();
const trialsController = require('../controllers/trials');

router.get('/all', trialsController.getAllTrials); // make pdf file
router.get('/make', trialsController.makeStudies); //create all new trials

router.get('/add/loc', trialsController.addLocations); //adds locations to studies

module.exports = router ; 