const express = require('express');
const router = express.Router();
 
 
 
 
module.exports = (pool) => {
  router.post('/tuika/:id', async (req, res) => {
    const userId = req.params.id; // URL パラメータから userid を取得
    const { breakfast, lunch, dinner } = req.body; // リクエストボディから breakfast, lunch, dinner を取得
  
    try {
      // foodテーブルから最新のfoodidを取得
      const foodResult = await pool.query(
        `SELECT foodid
         FROM food
         WHERE userid = $1
         ORDER BY created_at DESC
         LIMIT 1;`,
        [userId]
      );
  
      // 該当するデータが存在しない場合
      if (foodResult.rows.length === 0) {
        return res.status(404).json({ error: '指定されたユーザーのfoodデータが見つかりません' });
      }
  
      const latestFoodId = foodResult.rows[0].foodid;
  
      // breakfast, lunch, dinner を更新
      const updateResult = await pool.query(
        `UPDATE food
         SET 
           breakfast = COALESCE($1, breakfast),  -- breakfastが渡されていなければ既存値を保持
           lunch = COALESCE($2, lunch),          -- lunchが渡されていなければ既存値を保持
           dinner = COALESCE($3, dinner)         -- dinnerが渡されていなければ既存値を保持
         WHERE foodid = $4
         RETURNING *;`,
        [breakfast, lunch, dinner, latestFoodId]
      );
  
      // 更新されたデータが存在しない場合
      if (updateResult.rows.length === 0) {
        return res.status(404).json({ error: '指定されたユーザーのfoodデータが更新されませんでした' });
      }
  
      // 成功レスポンスを返す
      res.status(200).json({
        message: '最新のfoodテーブルのデータが更新されました',
        updatedFood: updateResult.rows[0],
      });
    } catch (error) {
      console.error('エラーが発生しました:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  });
  


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
        'SELECT breakfast, lunch, dinner FROM food WHERE userid = $1 LIMIT 1;',
         [userId]
        );
     
      if (result.rows.length > 0) {
        const { breakfast, lunch, dinner} = result.rows[0]; // 必要なカラムを取得
        return res.status(200).json({ breakfast, lunch, dinner }); // ユーザーに関連する食品データを返す
      } else {
        return res.status(404).json({ error: '食品データが見つかりません' }); // データが見つからない場合
      }
    } catch (error) {
      console.error('Failed to fetch food:', error);
      return res.status(500).json({ error: 'サーバーエラーが発生しました' }); // サーバーエラーを返す
    }
  });

  router.get('/recent/:id', async (req, res) => {
    const  userId  = req.params.id;
    const now = new Date();
    const resetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    try {
      const result = await pool.query(
         'SELECT * FROM food WHERE userid = $1 AND created_at > $2 LIMIT 1;',
         [userId,resetTime]
        );
     
      if (result.rows.length > 0) {
        return res.status(200).json(result.rows[0]);
      } else  {
        return res.status(404).json(); 
      }
    } catch (error) {
      console.error('Failed to fetch food:', error);
      return res.status(500).json({ error: 'サーバーエラーが発生しました' }); // サーバーエラーを返す
    }
  });
 
 
 
  return router;
};