const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.get('/login', userController.getLogIn);
router.get('/sign-up', userController.getSignUp);
router.post('/login', userController.postLogin);
router.post('/sign-up', userController.postSignUp);


module.exports = router;