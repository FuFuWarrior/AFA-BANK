const route = require('express').Router();
const cardCtrl = require('../controllers/card')

route.post( '/charge', cardCtrl.charge);

module.exports = route