const express = require('express');
const router = express.Router();
 
 
 
 
module.exports = (pool) => {
  router.post('/', async (req, res) => {
    const { userid, breakfast, lunch, dinner } = req.body;
    console.log("Request Body:", req.body);
    try {
      const result = await pool.query(
        'INSERT INTO food (userid, breakfast, lunch, dinner) VALUES ($1, $2, $3, $4) RETURNING *',
        [userid, breakfast, lunch, dinner]
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Failed to add food:', error);
      return res.status(500).json({ error: 'Failed to add food' });
    }
  });
 
 
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM food;');
      return res.status(200).json(result.rows); // すべての食品データを返す
    } catch (error) {
      console.error('Failed to fetch food:', error);
      return res.status(500).json({ error: 'Failed to fetch food' });
    }
  });
 
  // 特定のユーザーIDに紐づく食品データを取得
  router.get('/:id', async (req, res) => {
    const  userId  = req.params.id; // URLパラメータから userid を取得
 
    try {
      const result = await pool.query(
        'SELECT breakfast FROM foods WHERE userid = 1;',
         [userId]
        );
     
      if (result.rows.length > 0) {
        return res.status(200).json(result.rows); // ユーザーに関連する食品データを返す
      } else {
        return res.status(404).json({ error: '食品データが見つかりません' }); // データが見つからない場合
      }
    } catch (error) {
      console.error('Failed to fetch food:', error);
      return res.status(500).json({ error: 'サーバーエラーが発生しました' }); // サーバーエラーを返す
    }
  });
 
 
 
  return router;
};