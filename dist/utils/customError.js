class CustomError extends Error {
  constructor(msg, statusCode, error = new Error()) {
      super(msg);
      this.name = error.name;
      this.statusCode = statusCode;
      this.stack = error.stack;
  }
}

module.exports = { CustomError };