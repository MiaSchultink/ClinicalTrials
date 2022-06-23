const express = require('express');
const router = express.Router();
const trialsController = require('../controllers/trials');

router.get('/run', trialsController.run);// full run of everything

router.get('/all', trialsController.getAllTrials); // make pdf file
router.get('/make', trialsController.makeStudies); //create all new trials

router.get('/add/location', trialsController.addLocations); //adds locations to studies

router.get('/delete/all', trialsController.WIPEALL)

module.exports = router ; 