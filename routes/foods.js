const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.post('/', async (req, res) => {
    const { userid, breakfast, lunch, dinner, bkcal, lkcal, dkcal } = req.body;
    console.log("Request Body:", req.body);
    try {
      const result = await pool.query(
        'INSERT INTO food (userid, breakfast, lunch, dinner, bkcal, lkcal, dkcal) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [userid, breakfast, lunch, dinner, bkcal, lkcal, dkcal]
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
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Failed to fetch food:', error);
      return res.status(500).json({ error: 'Failed to fetch food' });
    }
  });

  /*ここデプロイする*/
app.get('/foods/:userId', async (req, res) => {
  const userId = req.params.userId;
 
  try {
      // SQLクエリで朝ごはんを取得
      const result = await db.query('SELECT breakfast FROM food WHERE user_id = $1 LIMIT 1', [userId]);
 
      if (result.rows.length > 0) {
          res.json({ breakfast: result.rows[0].breakfast });
          res.json({ lunch: result.rows[0].lunch });
          res.json({ dinner: result.rows[0].dinner });
      } else {
          res.status(404).json({ error: 'ごはんが設定されていません' });
      }
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

  return router;
};
