import crypto from 'crypto';

export const getHashPassword = (password: string, salt: string) => {
  return crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');
};

export const passwordEncryption = (password: string) => {
  const salt = crypto.randomBytes(10).toString('base64');
  const hashPassword = getHashPassword(password, salt);

  return { salt, hashPassword };
};
