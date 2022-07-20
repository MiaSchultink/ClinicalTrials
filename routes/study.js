const express = require('express');
const router = express.Router();
const studyController = require("../controllers/study");

router.get('/allData',studyController.getFindAll);

router.post('/make', studyController.makeStudies);

module.exports = router;