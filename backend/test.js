const bcrypt = require('bcrypt');

const storedHash = "$2b$10$7v55cMqEcq7lR03UggyyUOjjiBw/hrmQWh2Wcxfk8G39ROUwrHSh."; // Copy from DB
const plainPassword = "Zineb1212."; // Replace with actual admin password

bcrypt.compare(plainPassword, storedHash).then((result) => {
    console.log("Password Match:", result);
});
