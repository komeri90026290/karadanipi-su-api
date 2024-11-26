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
    const { foodid, trainingid, historyid} = req.body;
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

router.post('/:id', async (req, res) => {
    const userId = req.params.userid;
 
    try {
      // 最新の `created_at` を取得
      const latestHistory = await pool.query(
        'SELECT created_at FROM history WHERE userid = $1 ORDER BY created_at DESC LIMIT 1;',
        [userId]
      );
 
      const today = new Date().toISOString().split('T')[0]; // 今日の日付（YYYY-MM-DD形式）
 
      if (
        latestHistory.rows.length > 0 &&
        new Date(latestHistory.rows[0].created_at).toISOString().split('T')[0] === today
      ) {
        // 日付が同じなら、カラムを追加しない
        console.log(`ユーザーID ${userId}: 今日の履歴は既に存在します`);
        return res.status(200).json({ message: '今日の履歴は既に存在します' });
      } else {
        // 日付が異なる場合、新しい履歴を追加
        await pool.query(
          'INSERT INTO history (userid, foodid, trainingid, historyid, created_at) VALUES ($1, NULL, NULL, NULL, NOW());',
          [userId]
        );
        console.log(`ユーザーID ${userId}: 今日の履歴を追加しました`);
        return res.status(201).json({ message: '新しい履歴を追加しました' });
      }
    } catch (error) {
      console.error('履歴の確認中にエラーが発生しました:', error);
      return res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  });
 
 
  return router;
};