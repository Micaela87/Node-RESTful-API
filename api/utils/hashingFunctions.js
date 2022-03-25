const crypto = require('crypto');
const path = require('path');

// hashes passwords
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// hashes file names with extension
const hashFileName = (file) => {
    return crypto.createHash('sha256').update(file.name).digest('hex') + path.extname(file.name);
}

module.exports = { hashFileName, hashPassword };