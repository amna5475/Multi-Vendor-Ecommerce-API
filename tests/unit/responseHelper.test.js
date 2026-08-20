const ResponseHelper = require('../../helpers/responseHelper');

describe('ResponseHelper', () => {
  it('formats success responses consistently', () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    ResponseHelper.success(res, 'OK', { id: 1 }, 201);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 201,
      message: 'OK',
      data: { id: 1 }
    });
  });

  it('formats error responses consistently', () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    ResponseHelper.error(res, 'Failed', 400, { field: 'email' });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'Failed',
      errors: { field: 'email' }
    });
  });
});
