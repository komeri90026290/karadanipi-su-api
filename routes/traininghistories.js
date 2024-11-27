const express = require('express');
const router = express.Router();

module.exports = (pool) => {

    // トレーニング履歴を追加する API
    router.post('/', async (req, res) => {
        const { userid, trainingidlist } = req.body;

        try {
            const result = await pool.query(
                'INSERT INTO traininghistory (userid, trainingidlist) VALUES ($1, $2) RETURNING *',
                [userid, trainingidlist]
            );
            return res.status(201).json(result.rows[0]); // 作成したトレーニング履歴を返す
        } catch (error) {
            console.error('Failed to add training history:', error);
            return res.status(500).json({ error: 'Failed to add training history' });
        }
    });

    // 最近のトレーニング履歴を取得する API
    router.get('/recent/:id', async (req, res) => {
        const userId = req.params.id;
        const now = new Date();
        const resetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 今日の0時を取得

        try {
            const result = await pool.query(
                'SELECT * FROM traininghistory WHERE userid = $1 AND created_at > $2 LIMIT 1;',
                [userId, resetTime] // 今日の0時以降の履歴を取得
            );
            if(result.rows.length > 0){
                return res.status(200).json(result.rows[0]);
            } else  {
                return res.status(404).json(); 
            }        
        } catch (error) {
            console.error('Failed to fetch recent training history:', error);
            return res.status(500).json({ error: 'Failed to fetch recent training history' });
        }
    });

    // トレーニング履歴を更新する API
    router.put('/:id', async (req, res) => {
        const { trainingidlist, trainingHistoryId } = req.body;

        try {
            const result = await pool.query(
                'UPDATE traininghistory SET trainingidlist = $1 WHERE traininghistoryid = $2 RETURNING *',
                [trainingidlist, trainingHistoryId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Training history not found' });
            }

            return res.status(200).json(result.rows[0]); // 更新されたトレーニング履歴を返す
        } catch (error) {
            console.error('Failed to update training history:', error);
            return res.status(500).json({ error: 'Failed to update training history' });
        }
    });

    // 全てのトレーニング履歴を取得する API
    router.get('/', async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM traininghistory;');
            return res.status(200).json(result.rows); // 全てのトレーニング履歴を返す
        } catch (error) {
            console.error('Failed to fetch training histories:', error);
            return res.status(500).json({ error: 'Failed to fetch training histories' });
        }
    });

    // 最後に router を返すことを忘れずに
    return router;
};
