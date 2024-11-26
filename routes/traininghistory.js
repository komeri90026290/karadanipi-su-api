const express = require('express');
const router = express.Router();
 
module.exports = (pool) => {
  // トレーニング履歴の取得（1日1つの履歴）
  router.get('/traininghistory/:userId/:date', async (req, res) => {
    const { userid, date } = req.params;
    try {
      const result = await pool.query(
        'SELECT * FROM traininghistory WHERE userid = $1 AND DATE(created_at) = $2;',
        [userid, date]
      );
 
      if (result.rows.length > 0) {
        return res.status(200).json(result.rows[0]); // 該当する履歴データを返す
      } else {
        return res.status(404).json({ error: 'No training history found for this user on this date' });
      }
    } catch (error) {
      console.error('Failed to fetch training history:', error);
      return res.status(500).json({ error: 'Failed to fetch training history' });
    }
  });
 
  // トレーニング履歴の作成または更新
  router.post('/traininghistory', async (req, res) => {
    console.log('受信した履歴データ:', req.body);
 
    const { userid, trainingidlist } = req.body;
 
    if (!userid || !trainingidlist || !Array.isArray(trainingidlist)) {
      return res.status(400).json({
        error: 'Both userid and trainingidlist (as an array) are required'
      });
    }
 
    try {
      // トレーニングIDが有効かチェック
      const validTrainingIds = await pool.query(
        'SELECT trainingid FROM training WHERE trainingid = ANY($1);',
        [trainingidlist]
      );
 
      const validIds = validTrainingIds.rows.map(row => row.trainingid);
      const invalidIds = trainingidlist.filter(id => !validIds.includes(id));
 
      if (invalidIds.length > 0) {
        return res.status(400).json({
          error: 'Invalid training IDs found',
          invalidIds: invalidIds
        });
      }
 
      // 現在の日付での履歴が既に存在するか確認
      const today = new Date().toISOString().split('T')[0];
      const existingHistory = await pool.query(
        'SELECT * FROM traininghistory WHERE userid = $1 AND DATE(created_at) = $2;',
        [userid, today]
      );
 
      if (existingHistory.rows.length > 0) {
        // 既存の履歴があれば更新
        const currentTrainingIds = existingHistory.rows[0].trainingidlist;
        const updatedTrainingIds = Array.from(new Set([...currentTrainingIds, ...trainingidlist]));
 
        const updateResult = await pool.query(
          'UPDATE traininghistory SET trainingidlist = $1 WHERE userid = $2 AND DATE(created_at) = $3 RETURNING *;',
          [updatedTrainingIds, userid, today]
        );
 
        return res.status(200).json(updateResult.rows[0]); // 更新後のデータを返す
      } else {
        // 履歴がなければ新規作成
        const insertResult = await pool.query(
          'INSERT INTO traininghistory (userid, trainingidlist) VALUES ($1, $2) RETURNING *;',
          [userid, trainingidlist]
        );
 
        return res.status(201).json(insertResult.rows[0]); // 新規作成データを返す
      }
    } catch (error) {
      console.error('SQLエラー:', error);
      return res.status(500).json({ error: 'Failed to add or update training history' });
    }
  });
};