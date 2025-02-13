const express = require('express');
const router = express.Router();
 
 
 
 
module.exports = (pool) => {
  router.post('/tuika/:id', async (req, res) => {
    const userId = req.params.id; // URL パラメータから userid を取得
    const { breakfast, lunch, dinner } = req.body; // リクエストボディから breakfast, lunch, dinner を取得
  
    try {
      // foodテーブルから最新のfoodidを取得
      const foodResult = await pool.query( // SQL クエリを実行
        `SELECT foodid 
         FROM food 
         WHERE userid = $1
         ORDER BY created_at DESC 
         LIMIT 1;`, 
        [userId] 
      );
  
    
  
      const latestFoodId = foodResult.rows[0].foodid; // 最新の foodid を取得
  
      // breakfast, lunch, dinner を更新
      const updateResult = await pool.query( // SQL クエリを実行
        `UPDATE food 
         SET  
           breakfast = COALESCE($1, breakfast),  
           lunch = COALESCE($2, lunch),          
           dinner = COALESCE($3, dinner)         
         WHERE foodid = $4
         RETURNING *;`, 
         [breakfast, lunch, dinner, latestFoodId] 
      );
  

  
      // 成功レスポンスを返す
      res.status(200).json({ // ステータスコード 200 で
        message: '最新のfoodテーブルのデータが更新されました', // メッセージを返す
        updatedFood: updateResult.rows[0], // 更新されたデータを返す
      });
    } catch (error) { // エラーが発生した場合
      console.error('エラーが発生しました:', error); // エラーログを出力
      res.status(500).json({ error: 'サーバーエラーが発生しました' }); // サーバーエラーを返す
    }
  });
  


  router.post('/', async (req, res) => { // POST メソッドで /foods にアクセスされた場合
    const { userid, breakfast, lunch, dinner } = req.body; // リクエストボディから userid, breakfast, lunch, dinner を取得
    console.log("Request Body:", req.body); // デバッグ用にリクエストデータを確認
    try {
      const result = await pool.query( // SQL クエリを実行
        'INSERT INTO food (userid, breakfast, lunch, dinner) VALUES ($1, $2, $3, $4) RETURNING *', // SQL クエリを実行
        [userid, breakfast, lunch, dinner] // プレースホルダに値をセット
      );
      return res.status(201).json(result.rows[0]); // ステータスコード 201 で新しく追加された食品データを返す
    } catch (error) { // エラーが発生した場合
      console.error('Failed to add food:', error); // エラーログを出力
      return res.status(500).json({ error: 'Failed to add food' }); // サーバーエラーを返す
    }
  });
 
 
  router.get('/', async (req, res) => { // GET メソッドで /foods にアクセスされた場合
    try {
      const result = await pool.query('SELECT * FROM food;'); // SQL クエリを実行
      return res.status(200).json(result.rows); // すべての食品データを返す
    } catch (error) { // エラーが発生した場合
      console.error('Failed to fetch food:', error); // エラーログを出力
      return res.status(500).json({ error: 'Failed to fetch food' }); // サーバーエラーを返す
    }
  });
 
  // 特定のユーザーIDに紐づく食品データを取得
  router.get('/:id', async (req, res) => {
    const  userId  = req.params.id; // URLパラメータから userid を取得
 
    try {
      const result = await pool.query( // SQL クエリを実行
        'SELECT breakfast, lunch, dinner, created_at FROM food WHERE userid = $1 ORDER BY created_at DESC LIMIT 1;', // SQL クエリを実行
         [userId] // プレースホルダに指定されたユーザーIDをセット
        );
     
      if (result.rows.length > 0) {
        const { breakfast, lunch, dinner, created_at} = result.rows[0]; // 必要なカラムを取得
        return res.status(200).json({ breakfast, lunch, dinner, created_at }); // ユーザーに関連する食品データを返す
      } else {
        return res.status(404).json({ error: '食品データが見つかりません' }); // データが見つからない場合
      }
    } catch (error) {
      console.error('Failed to fetch food:', error);
      return res.status(500).json({ error: 'サーバーエラーが発生しました' }); // サーバーエラーを返す
    }
  });

  router.get('/recent/:id', async (req, res) => { // GET メソッドで /foods にアクセスされた場合
    const  userId  = req.params.id; // URLパラメータから userid を取得
    const now = new Date(); // 現在時刻を取得
    const resetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 今日の 0 時 0 分 0 秒を取得

    try { 
      const result = await pool.query( // SQL クエリを実行
         'SELECT * FROM food WHERE userid = $1 AND created_at > $2 LIMIT 1;', // SQL クエリを実行
         [userId,resetTime] // プレースホルダに指定されたユーザーIDをセット
        );
     
      if (result.rows.length > 0) {  // 取得した行数が 0 より大きい場合
        return res.status(200).json(result.rows[0]); // すべての食品データを返す
      } else  {
        return res.status(404).json();  // データが見つからない場合
      }
    } catch (error) {
      console.error('Failed to fetch food:', error); // エラーログを出力
      return res.status(500).json({ error: 'サーバーエラーが発生しました' }); // サーバーエラーを返す
    }
  });
 
 
 
  return router;
};