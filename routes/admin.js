const express = require('express');
const router = express.Router();
const trialsController = require('../controllers/trials');
const adminController = require('../controllers/admin');

router.get('/run', adminController.run);// full run of everything

router.get('/make/files',adminController.buildJSONFiles);

router.get('/delete/all', adminController.wipeAll)

router.get('/test', adminController.test);

//router.get('/get/fields',trialsController.getFindAll);

//router.post('/studies/make', trialsController.generateStudies);



module.exports = router ; 