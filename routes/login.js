const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.post('/', async (req, res) => {
    const { username, password } = req.body;
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1 AND password = $2',
        [username, password]
      );
      if (result.rows.length > 0) {
        return res.status(200).json({ message: 'ログイン成功', userId: result.rows[0].userid });
      } else {
        return res.status(401).json({ error: 'ユーザー名またはパスワードが正しくありません' });
      }
    } catch (error) {
      console.error('Failed to login:', error);
      return res.status(500).json({ error: 'Failed to login' });
    }
  });

  return router;
};
