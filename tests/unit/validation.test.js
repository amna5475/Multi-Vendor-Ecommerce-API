const validate = require('../../middleware/validation');

describe('Validation middleware', () => {
  it('passes when payload is valid', () => {
    const middleware = validate({ email: 'required|email', password: 'required|string|min:6' });
    const req = { body: { email: 'user@example.com', password: 'secret1' }, query: {}, params: {} };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('returns BadRequestError when payload is invalid', () => {
    const middleware = validate({ email: 'required|email' });
    const req = { body: { email: 'not-an-email' }, query: {}, params: {} };
    const next = jest.fn();

    middleware(req, {}, next);

    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Validation failed');
  });
});
