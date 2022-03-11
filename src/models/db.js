const {Pool} = require("pg");
require('dotenv').config()
// console.log(process.env.PG_CONNECTION_STRING)
const pool = new Pool({
    connectionString: process.env.PG_CONNECTION_STRING
})

// const pool = new Pool({
//     user : 'postgres',
//     password: 'postgres',
//     host : 'localhost',
//     port :  '5432',
//     database: 'afa-test'
// });

// pool.on('connect', () => console.log('working'))

// pool.query('SELECT * FROM USERS').then( result => console.log(result.rows)).catch(err => console.log(err))

// async function kk() {
//      let o = await pool.query('SELECT * FROM USERS')
//      console.log(o.rows);
// }

// kk()


module.exports = pool;