const express = require('express');
const router = express.Router();
const trialsController = require('../controllers/trials');

// router.get('/run', trialsController.run);// full run of everything

// router.get('/make/files',trialsController.buildJSONFiles);

// router.get('/delete/all', trialsController.wipeAll)

// router.get('/test', trialsController.test);

router.get('/get/fields',trialsController.getFindAll);

router.post('/studies/make', trialsController.generateStudies);



module.exports = router ; 