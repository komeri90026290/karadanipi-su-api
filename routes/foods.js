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
        'SELECT *FROM foods WHERE userid = $1;',
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
 

  // app.post('/', async (req, res) => {
  //   const { userid } = req.body;
  
  //   if (!userid) {
  //     return res.status(400).json({ message: 'userid is required' });
  //   }
  
  //   try {
  //     // 今日の日付を取得 (YYYY-MM-DD)
  //     const today = new Date().toISOString().split('T')[0];
  
  //     // 重複チェック: 今日すでにデータがあるか確認
  //     const checkQuery = `
  //       SELECT * FROM food
  //       WHERE userid = $1 AND created_date = $2
  //     `;
  //     const checkResult = await pool.query(checkQuery, [userid, today]);
  
  //     if (checkResult.rows.length > 0) {
  //       // 既存データがある場合は挿入をスキップ
  //       return res.status(200).json({ message: 'Data already exists for today', data: checkResult.rows[0] });
  //     }
  
  //     // 新しい空データを挿入
  //     const insertQuery = `
  //       INSERT INTO food (userid, breakfast, lunch, dinner, created_at, created_date)
  //       VALUES ($1, '', '', '', NOW(), $2)
  //       RETURNING *
  //     `;
  //     const insertResult = await pool.query(insertQuery, [userid, today]);
  
  //     res.status(201).json({ message: 'Empty data added successfully', data: insertResult.rows[0] });
  //   } catch (error) {
  //     console.error('Error adding empty data:', error);
  //     res.status(500).json({ message: 'Internal server error' });
  //   }
  // });
 
 
  return router;
};