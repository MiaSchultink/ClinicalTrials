const express = require('express');
const router = express.Router();
const trialsController = require('../controllers/trials');

router.get('/run', trialsController.run);// full run of everything

// router.get('/make', trialsController.makeStudies); //create all new trials
// router.get('/add/location', trialsController.addLocations); //adds locations to studies
router.get('/make/files',trialsController.buildJSONFiles);

router.get('/delete/all', trialsController.wipeAll)

router.get('/search', trialsController.search);

router.get('/test', trialsController.test);

module.exports = router ; 