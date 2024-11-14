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
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Failed to fetch food:', error);
      return res.status(500).json({ error: 'Failed to fetch food' });
    }
  });


  return router;
};
