const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM users;');
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // ユーザーの追加
  router.post('/', async (req, res) => {
    const { username, password, height, weight } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO users (username, password, height, weight) VALUES ($1, $2, $3, $4) RETURNING *',
        [username, password, height, weight]
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Failed to add user:', error);
      return res.status(500).json({ error: 'Failed to add user' });
    }
  });

// userId に基づいて特定のユーザーを取得
router.get('/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE userid = $1',
            [userId]
        );

        if (result.rows.length > 0) {
            return res.status(200).json(result.rows[0]);  // 一致するユーザーを返す
        } else {
            return res.status(404).json({ error: 'User not found' });  // ユーザーが存在しない場合
        }
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return res.status(500).json({ error: 'Failed to fetch user' });
    }
});


  return router;
};
