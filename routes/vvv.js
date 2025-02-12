const express = require('express');
const router = express.Router();
 
module.exports = (pool) => {

    router.get('/getallweights/:id', async (req, res) => {
        const userId = req.params.id;
        
        try {
            console.log("リクエストID:", userId); // ← ユーザーIDが取得できているか確認
    
            // 指定されたユーザーの全 weight データを取得
            const weightResult = await pool.query(
                `SELECT weight, created_at  
                 FROM history
                 WHERE userid = $1
                 ORDER BY created_at ASC;`,
                [userId]
            );
    
            console.log("取得データ:", weightResult.rows); // ← データが取れているか確認
    
            if (weightResult.rows.length === 0) {
                console.log("データなし: ユーザーID", userId);
                return res.status(404).json({ error: '指定されたユーザーの weight データが見つかりません' });
            }
    
            res.status(200).json({
                message: 'すべての weight データを取得しました',
                weights: weightResult.rows,
            });
    
        } catch (error) {
            console.error('サーバーエラー:', error);  // ← エラー詳細をログに出力
            res.status(500).json({ error: 'サーバーエラーが発生しました', details: error.message });
        }
    });

    return router;
};