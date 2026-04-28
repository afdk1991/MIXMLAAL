const authService = require('../../services/authservice');

const authController = {
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      const result = await authService.login(email, password);
      res.json({
        code: 200,
        message: '登录成功',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        code: 401,
        message: error.message,
        data: null
      });
    }
  },

  register: async (req, res) => {
    const { username, email, password } = req.body;

    try {
      const result = await authService.register(username, email, password);
      res.json({
        code: 200,
        message: '注册成功',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message,
        data: null
      });
    }
  },

  logout: async (req, res) => {
    res.json({
      code: 200,
      message: '登出成功',
      data: null
    });
  },

  refreshToken: async (req, res) => {
    const { refreshToken } = req.body;

    try {
      const decoded = authService.verifyToken(refreshToken);
      const user = await authService.getUserById(decoded.id);
      const newToken = authService.generateToken(user);

      res.json({
        code: 200,
        message: '刷新token成功',
        data: { token: newToken }
      });
    } catch (error) {
      res.status(401).json({
        code: 401,
        message: 'refresh token无效或已过期',
        data: null
      });
    }
  },

  getMe: async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '未授权',
        data: null
      });
    }

    try {
      const user = await authService.getUserById(userId);
      res.json({
        code: 200,
        message: '获取用户信息成功',
        data: user
      });
    } catch (error) {
      res.status(404).json({
        code: 404,
        message: error.message,
        data: null
      });
    }
  }
};

module.exports = authController;