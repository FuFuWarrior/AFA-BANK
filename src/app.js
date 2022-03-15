const express = require('express');
const session = require('express-session');
const pgSessionStore = require('connect-pg-simple')(session);
// require('dotenv').config()

const pool = require('./models/db');
const userRoutes = require('./routes/userRoutes');
const cardRoutes = require('./routes/cardRoutes');
const transferRoutes = require('./routes/transferRoutes');
// const sessions = require('./middlewares/session').sessions


const app =  express();

// app.use(sessions)

app.use(session({
    name: 'Sess_name',
    store: new pgSessionStore({
        pool : pool,
        tableName : 'sessions'
      // Insert connect-pg-simple options here
    }),
    secret: process.env.FOO_COOKIE_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: { 
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/', 
        httpOnly:true, 
        secure:false,
        sameSite: true,
    } 
    // Insert express-session options here
}));

// TODO install cors, ratelimiter, cypress,

// Setting up the json parser to be able to parse JSON over the net
app.use(express.json());

// This is to disable the x-powered-by
app.disable("x-powered-by");

app.get("*", function(req, res){
    // req.session.destroy((err) => {
    //     if (!err){
    //         console.log(req.session)
    //     }
    // })
    res.status(200).json({
        message: 'Welcome to AFA Bank'
    })
})

app.use('/api/v1/', userRoutes);
app.use('/api/v1/', cardRoutes);
app.use('/api/v1/', transferRoutes);

module.exports = app;