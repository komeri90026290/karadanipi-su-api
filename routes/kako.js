const express = require('express');
const router = express.Router();
 

// 過去記録取得エンドポイント
module.exports = (pool) => {
router.get('/histories/:userid/:offset', async (req, res) => {
    const userId = req.params.userid;
    const offset = parseInt(req.params.offset, 10); // ページング用のオフセット
  
    try {
      // 指定したユーザーの特定ページのhistoryを取得
      const historyQuery = `
        SELECT *
        FROM history
        WHERE userid = $1
        ORDER BY created_at DESC
        LIMIT 1 OFFSET $2
      `;
      const historyResult = await pool.query(historyQuery, [userId, offset]);
  
      if (historyResult.rows.length === 0) {
        return res.status(404).json({ error: '該当する履歴が見つかりません' });
      }
  
      const history = historyResult.rows[0];
      const { foodid, traininghistoryid, weight, created_at } = history;
  
      // foodテーブルからデータを取得
      const foodQuery = `SELECT * FROM food WHERE foodid = $1`;
      const foodResult = await pool.query(foodQuery, [foodid]);
      const food = foodResult.rows[0];
  
      // traininghistoryテーブルからデータを取得
      const trainingHistoryQuery = `SELECT * FROM traininghistory WHERE traininghistoryid = $1`;
      const trainingHistoryResult = await pool.query(trainingHistoryQuery, [traininghistoryid]);
      const trainingHistory = trainingHistoryResult.rows[0];
  
      let trainings = [];
      if (trainingHistory) {
        const trainingIds = trainingHistory.trainingidlist || [];
        // trainingテーブルからデータを取得
        const trainingQuery = `
          SELECT * 
          FROM training 
          WHERE trainingid = ANY($1::int[])
        `;
        const trainingResult = await pool.query(trainingQuery, [trainingIds]);
        trainings = trainingResult.rows;
      }
  
      // 結果を返す
      res.status(200).json({
        history: { weight, created_at },
        food,
        trainings,
      });
    } catch (error) {
      console.error('エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  });
}