const pool = require('./db.js');

pool.query('select * from users')
.then( res => console.log).catch(err => console.log)