const {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError
} = require('../../adapters/errorAdapter');

describe('Error adapters', () => {
  it('creates BadRequestError with status 400', () => {
    const error = BadRequestError('Invalid payload', { field: 'email' });
    expect(error.message).toBe('Invalid payload');
    expect(error.statusCode).toBe(400);
    expect(error.errors).toEqual({ field: 'email' });
  });

  it('creates UnauthorizedError with status 401', () => {
    expect(UnauthorizedError().statusCode).toBe(401);
  });

  it('creates ForbiddenError with status 403', () => {
    expect(ForbiddenError('No access').statusCode).toBe(403);
  });

  it('creates NotFoundError with status 404', () => {
    expect(NotFoundError().statusCode).toBe(404);
  });

  it('creates TooManyRequestsError with status 429', () => {
    expect(TooManyRequestsError().statusCode).toBe(429);
  });
});
