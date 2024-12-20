const express = require('express');
const router = express.Router();
 
module.exports = (pool) => {
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT u.*
        FROM users u
        JOIN (
            SELECT userid, MAX(created_at) AS latest_created_at
            FROM users
            GROUP BY userid
        ) latest ON u.userid = latest.userid AND u.created_at = latest.latest_created_at;
      `);
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  });
 
  router.put('/:id', async (req, res) => {
    const { username, password, height, weight,mokuhyou } = req.body;
    const {id} =req.params;
 
    try {
      // 更新する項目を指定してSQLクエリを作成
      const result = await pool.query(
        `UPDATE users SET
          username = COALESCE($1, username),
          password = COALESCE($2, password),
          height = COALESCE($3, height),
          weight = COALESCE($4, weight),
          mokuhyou = COALESCE($5, mokuhyou)
         WHERE userid = $6
         RETURNING *`,
        [username, password, height, weight,mokuhyou, id]
      );
 
      // 更新が成功したかチェック
      if (result.rows.length > 0) {
        return res.status(200).json(result.rows[0]);  // 更新後のユーザーデータを返す
      } else {
        return res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      return res.status(500).json({ error: 'Failed to update user' });
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
 
    //新規会員登録新機能
 
    router.post('/add', async (req, res) => {
      const { userId, height, weight } = req.body;
   
      try {
        // 1. userIdに基づいてユーザー情報を取得
        const userResult = await pool.query(
          'SELECT username, password, created_at FROM users WHERE userid = $1',
          [userId]
        );
   
        if (userResult.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
   
        const userData = userResult.rows[0];
   
        // 2. 新しいテーブルにデータを挿入
        const insertResult = await pool.query(
          'INSERT INTO users (userid, username, password, height, weight, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [userId, userData.username, userData.password, height, weight, userData.created_at]
        );
   
        return res.status(201).json(insertResult.rows[0]);
      } catch (error) {
        console.error('Failed to add data:', error);
        return res.status(500).json({ error: 'Failed to add data' });
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