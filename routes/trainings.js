const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // トレーニング一覧を取得
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM training;');
      return res.status(200).json(result.rows); // 全てのトレーニングデータを返す
    } catch (error) {
      console.error('Failed to fetch training data:', error);
      return res.status(500).json({ error: 'Failed to fetch training data' });
    }
  });

  // 特定のトレーニングデータを取得
  router.get('/:id', async (req, res) => {
    const trainingId = req.params.id;
    try {
      const result = await pool.query(
        'SELECT * FROM training WHERE trainingid = $1',
        [trainingId]
      );

      if (result.rows.length > 0) {
        return res.status(200).json(result.rows[0]); // 一致するトレーニングデータを返す
      } else {
        return res.status(404).json({ error: 'Training data not found' }); // データが存在しない場合
      }
    } catch (error) {
      console.error('Failed to fetch training data:', error);
      return res.status(500).json({ error: 'Failed to fetch training data' });
    }
  });

  // トレーニングの追加
  router.post('/', async (req, res) => {
    const { userId, part, exercise, seconds, reps, sets } = req.body;
 
    if (!userId || !part, exercise, seconds, reps, sets) {
      return res.status(400).json({ error: 'userId and detail are required' });
    }
 
    try {
      const result = await pool.query(
        'INSERT INTO training (userid, part, exercise, seconds, reps, sets, totaltimeorreps) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [userId, [detail]]
      );
      return res.status(201).json(result.rows[0]); // 追加されたトレーニングデータを返す
    } catch (error) {
      console.error('Failed to add training data:', error);
      return res.status(500).json({ error: 'Failed to add training data' });
    }
  });

  return router;
};
