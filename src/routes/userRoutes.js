const route = require('express').Router();
const UserCtrl = require('../controllers/userCtrl');


route.post('/auth/signup/', UserCtrl.signUp);

route.post('/auth/login/', UserCtrl.logIn)

module.exports = route;