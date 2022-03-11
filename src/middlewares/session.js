const session = require('express-session');
const pgSessionStore = require('connect-pg-simple')(session);

const pool = require('../models/db');
require('dotenv').config();

exports.sessions = session({
    name: 'Sess_name',
    store: new pgSessionStore({
        pool : pool,
        tableName : 'sessions' 
      // Insert connect-pg-simple options here
    }),
    secret: process.env.FOO_COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/', 
        httpOnly:true,
        secure:false,
        sameSite: 'lax'
    } 
    // Insert express-session options here
  });