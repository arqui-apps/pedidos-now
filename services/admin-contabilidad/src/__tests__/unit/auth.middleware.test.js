
const { verificarToken } = require('../../middleware/auth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer token_valido_aqui'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('verificarToken', () => {
    it('debe pasar al siguiente middleware si token es válido', (done) => {
      const decoded = { id: 1, email: 'user@example.com' };
      jwt.verify.mockReturnValue(decoded);

      verificarToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual(decoded);
      done();
    });

    it('debe rechazar si no hay token', (done) => {
      req.headers.authorization = undefined;

      verificarToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No autorizado'
      });
      expect(next).not.toHaveBeenCalled();
      done();
    });

    it('debe rechazar si token tiene formato incorrecto', (done) => {
      req.headers.authorization = 'InvalidFormat';

      verificarToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No autorizado'
      });
      expect(next).not.toHaveBeenCalled();
      done();
    });

    it('debe rechazar si token es inválido', (done) => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Token inválido');
      });

      verificarToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token inválido'
      });
      expect(next).not.toHaveBeenCalled();
      done();
    });
  });
});