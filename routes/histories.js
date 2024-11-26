const express = require('express');
const router = express.Router();
 
module.exports = (pool) => {
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM history;');
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      return res.status(500).json({ error: 'Failed to fetch history' });
    }
  });
 
  router.put('/:id', async (req, res) => {
    const { foodid, trainingid, historyid } = req.body;
    const {id} =req.params;
 
    try {
      // 更新する項目を指定してSQLクエリを作成
      const result = await pool.query(
        `UPDATE history SET
          foodid= COALESCE($1, foodid),
          trainingid = COALESCE($2, trainingid),
          historyid = COALESCE($3, historyid),
         WHERE userid = $6
         RETURNING *`,
        [foodid, trainingid, historyid, id]
      );
 
      // 更新が成功したかチェック
      if (result.rows.length > 0) {
        return res.status(200).json(result.rows[0]);  // 更新後のユーザーデータを返す
      } else {
        return res.status(404).json({ error: 'history not found' });
      }
    } catch (error) {
      console.error('Failed to update history:', error);
      return res.status(500).json({ error: 'Failed to update history' });
    }
  });
 
  // ユーザーの追加
  router.post('/', async (req, res) => {
    const { username, password, height, weight } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO history (foodid, trainingid, historyid) VALUES ($1, $2, $3) RETURNING *',
        [foodid, trainingid, historyid]
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Failed to add user:', error);
      return res.status(500).json({ error: 'Failed to add user' });
    }
  });

    router.get('/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await pool.query(
            'SELECT * FROM history WHERE userid = $1',
            [userId]
        );
 
        if (result.rows.length > 0) {
            return res.status(200).json(result.rows[0]);  // 一致するユーザーを返す
        } else {
            return res.status(404).json({ error: 'history not found' });  // ユーザーが存在しない場合
        }
    } catch (error) {
        console.error('Failed to fetch history:', error);
        return res.status(500).json({ error: 'Failed to fetch history' });
    }
});
 
 
  return router;
};