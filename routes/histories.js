const express = require('express');
const router = express.Router();
 
module.exports = (pool) => {

// foodid を transfer する API
router.post('/getfood/:id', async (req, res) => {
  const userId = req.params.id;
  try {
      // historyテーブルから最新のfoodidを取得
      const historyResult = await pool.query(
          `SELECT foodid
           FROM food
           WHERE userid = $1
           ORDER BY created_at DESC
           LIMIT 1;`,
          [userId]
      );

      if (historyResult.rows.length === 0) {
          return res.status(404).json({ error: '履歴が見つかりません' });
      }

      const latestFoodId = historyResult.rows[0].foodid;

      if (!latestFoodId) {
          return res.status(400).json({ error: '最新の履歴にfoodidが設定されていません' });
      }

    // 指定したuseridの最新のhistoryデータを更新
    const updateResult = await pool.query(
      `UPDATE history
       SET foodid = $1
       WHERE userid = $2
       AND historyid = (
         SELECT historyid
         FROM history
         WHERE userid = $2
         ORDER BY created_at DESC
         LIMIT 1
       )
       RETURNING *;`,
      [latestFoodId, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: '指定されたユーザーのhistoryデータが見つかりません' });
    }

    res.status(200).json({
      message: '最新のfoodidをhistoryテーブルの最新データに更新しました',
      updatedHistory: updateResult.rows[0],
    });
  } catch (error) {
    console.error('エラーが発生しました:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});



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
    const { foodid, traininghistoryid, historyid } = req.body;
    const {id} =req.params;
 
    try {
      // 更新する項目を指定してSQLクエリを作成
      const result = await pool.query(
        `UPDATE history SET
          foodid= COALESCE($1, foodid),
          traininghistoryid = COALESCE($2, traininghistoryid),
          historyid = COALESCE($3, historyid),
         WHERE userid = $4
         RETURNING *`,
        [foodid, traininghistoryid, historyid, id]
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
    const { foodid, traininghistoryid, historyid} = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO history (foodid, traininghistoryid, historyid) VALUES ($1, $2, $3) RETURNING *',
        [foodid, traininghistoryid, historyid]
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
    const userId = req.params.id;
 
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
          'INSERT INTO history (userid, foodid, traininghistoryid) VALUES ($1, NULL, NULL);',
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