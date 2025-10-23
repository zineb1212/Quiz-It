const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Change this if you have a different MySQL user
    password: 'Zineb1212.', // Use the password you set for MySQL
    database: 'quiz_system'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('✅ Database connected successfully');
});

module.exports=db;