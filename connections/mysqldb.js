const mysql = require('mysql2');
require('dotenv').config()

// const connection = mysql.createConnection({
//     port: 3306,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: 'sandbox'
// });

const connection = mysql.createConnection({
    host: "db4free.net",
    port: 3306,
    user: "hilmawanz",
    password: "hiljak57",
    database: 'sandbox'
});

connection.connect((err) => {
    if (err) {
        console.error("error connecting: " + err.stack);
        return;
    }
    console.log("connected as id " + connection.threadId);
});

module.exports = connection
