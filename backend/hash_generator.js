const bcrypt = require('bcrypt');

async function hashPassword() {
    const password = 'Zineb1212.'; // Replace with your admin's actual password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Hashed Password:", hashedPassword);
}

hashPassword();
