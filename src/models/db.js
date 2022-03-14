const {Pool} = require("pg");

// ! REMOVE "dotenv" dep
// ! ADD ENV VARS IN HEROKU (process.env.DATABASE_URL) AND (process.env.TOKEN_SECRET)
// const isProduction = process.env.NODE_ENV === "production";
//connection config for production
// const pool = new Pool({
//     connectionString: isProduction ? process.env.DATABASE_URL : process.env.HEROKU_POSTGRESQL_GREEN_URL,
//     ssl: true
// });

const pool = new Pool({
   ssl: {
    rejectUnauthorized: false
  },
  connectionString: process.env.DATABASE_URL
});

// const pool = new Pool({
//   connectionString : process.env.PG_CONNECTION_STRING_CHANGED
// });

pool.on('connect', () => console.log('Working'))


module.exports = pool;