class UnauthorizedError extends Error {
  constructor (code, error) {
    super(error.message);
    this.name = 'UnauthorizedError';
    this.code = code;
    this.status = 401;
    this.inner = error;
  }
}

module.exports = UnauthorizedError;
