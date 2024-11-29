const express = require('express');
const router = express.Router();

module.exports = (pool) => {

  // 過去記録取得エンドポイント
router.get('/:id/:offset', async (req, res) => {
  const userId = req.params.id;
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







  router.post('/updateheight/:id', async (req, res) => {
    const userId = req.params.id;
    const { weight } = req.body; // weightのみリクエストボディから取得

    try {
      // 入力値の検証
      if (weight == null) {
        return res.status(400).json({ error: 'weightを指定してください' });
      }

      // 更新対象のhistoryレコードを特定してweightを更新
      const updateResult = await pool.query(
        `UPDATE history
         SET 
           weight = $1  -- 新しいweightを更新
         WHERE userid = $2
         AND historyid = (
           SELECT historyid
           FROM history
           WHERE userid = $2
           ORDER BY created_at DESC
           LIMIT 1
         )
         RETURNING *;`,
        [weight, userId]
      );

      // レコードが見つからない場合の処理
      if (updateResult.rows.length === 0) {
        return res.status(404).json({ error: '指定されたユーザーのhistoryデータが見つかりません' });
      }

      // 成功レスポンスを返す
      res.status(200).json({
        message: '最新のweightをhistoryテーブルの最新データに更新しました',
        updatedHistory: updateResult.rows[0],
      });
    } catch (error) {
      console.error('エラーが発生しました:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  });


    // torehisid を transfer する API
router.post('/gettore/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    // foodテーブルから最新のfoodidを取得
    const toreResult = await pool.query(
      `SELECT traininghistoryid
       FROM traininghistory
       WHERE userid = $1
       ORDER BY created_at DESC
       LIMIT 1;`,
      [userId]
    );

    if (toreResult.rows.length === 0) {
      return res.status(404).json({ error: '指定されたユーザーのトレーニングヒストリーが見つかりません' });
    }

    const latestToreId = toreResult.rows[0].traininghistoryid;

    if (!latestToreId) {
      return res.status(400).json({ error: '最新のトレーニングヒストリーにトレーニングヒストリーidが設定されていません' });
    }

    // 指定したuseridの最新のhistoryデータを更新
    const updateResult = await pool.query(
      `UPDATE history
       SET traininghistoryid = $1
       WHERE userid = $2
       AND historyid = (
         SELECT historyid
         FROM history
         WHERE userid = $2
         ORDER BY created_at DESC
         LIMIT 1
       )
       RETURNING *;`,
      [latestToreId, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: '指定されたユーザーのhistoryデータが見つかりません' });
    }

    res.status(200).json({
      message: '最新のtoreidをhistoryテーブルの最新データに更新しました',
      updatedHistory: updateResult.rows[0],
    });
  } catch (error) {
    console.error('エラーが発生しました:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});


  // foodid を transfer する API
router.post('/getfood/:id', async (req, res) => {
  const userId = req.params.id;
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

    if (foodResult.rows.length === 0) {
      return res.status(404).json({ error: '指定されたユーザーのfoodデータが見つかりません' });
    }

    const latestFoodId = foodResult.rows[0].foodid;

    if (!latestFoodId) {
      return res.status(400).json({ error: '最新のfoodデータにfoodidが設定されていません' });
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


// // foodid を transfer する API
// router.post('/getfood/:id', async (req, res) => {
//   const userId = req.params.id;
//   try {
//       // historyテーブルから最新のfoodidを取得
//       const historyResult = await pool.query(
//           `SELECT foodid
//            FROM food
//            WHERE userid = $1
//            ORDER BY created_at DESC
//            LIMIT 1;`,
//           [userId]
//       );

//       if (historyResult.rows.length === 0) {
//           return res.status(404).json({ error: '履歴が見つかりません' });
//       }

//       const latestFoodId = historyResult.rows[0].foodid;

//       if (!latestFoodId) {
//           return res.status(400).json({ error: '最新の履歴にfoodidが設定されていません' });
//       }

//       // historyテーブルにfoodidを挿入
//       await pool.query(
//         `INSERT INTO history (userid, foodid)
//          VALUES ($1, $2);`,
//         [userId,latestFoodId]
//     );

//     res.status(201).json({ message: '最新のfoodidをhistoryテーブルに挿入しました' });    res.status(200).json({
//       message: '最新のfoodidをhistoryテーブルの最新データに更新しました',
//       updatedHistory: updateResult.rows[0],
//     });
//   } catch (error) {
//     console.error('エラーが発生しました:', error);
//     res.status(500).json({ error: 'サーバーエラーが発生しました' });
//   }
// });



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