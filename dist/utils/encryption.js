const crypto = require('crypto');

exports.getHashPassword = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');
}

exports.passwordEncryption = (password) => {
    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = this.getHashPassword(password, salt);

    return { salt, hashPassword };
}