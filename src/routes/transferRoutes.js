const route = require('express').Router();
const transferCtrl =  require('../controllers/transfer')

route.post('/transfer', transferCtrl.transfer)

module.exports = route;