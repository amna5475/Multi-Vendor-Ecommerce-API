const jwt = require('jsonwebtoken');
const { authMiddleware, authorize } = require('../../middleware/auth');

describe('Auth middleware', () => {
  const secret = process.env.JWT_SECRET;

  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('rejects missing bearer token', () => {
    const req = { headers: {} };
    const next = jest.fn();

    authMiddleware(req, mockRes(), next);

    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(401);
  });

  it('attaches decoded user for a valid token', () => {
    const token = jwt.sign({ id: 'user-1', role: 'customer' }, secret, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();

    authMiddleware(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toMatchObject({ id: 'user-1', role: 'customer' });
  });

  it('authorize blocks disallowed roles', () => {
    const req = { user: { role: 'customer' } };
    const next = jest.fn();

    authorize(['seller', 'admin'])(req, mockRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it('authorize allows matching roles', () => {
    const req = { user: { role: 'seller' } };
    const next = jest.fn();

    authorize(['seller', 'admin'])(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith();
  });
});
