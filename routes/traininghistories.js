const express = require('express'); // express モジュールを読み込む
const router = express.Router(); // express の Router オブジェクトを取得

module.exports = (pool) => { // このファイルがモジュールとして読み込まれた際に関数をエクスポートする

    // トレーニング履歴を追加する API
    router.post('/', async (req, res) => { // POST メソッドで /traininghistories にアクセスされた場合
        const { userid, trainingidlist } = req.body; // リクエストボディから userid, trainingidlist を取得

        try {
            const result = await pool.query( // SQL クエリを実行
                'INSERT INTO traininghistory (userid, trainingidlist) VALUES ($1, $2) RETURNING *', // SQL クエリを実行
                [userid, trainingidlist] // プレースホルダに指定された userid, trainingidlist をセット
            );
            return res.status(201).json(result.rows[0]); // 作成したトレーニング履歴を返す
        } catch (error) {
            console.error('Failed to add training history:', error); // エラーログを出力
            return res.status(500).json({ error: 'Failed to add training history' }); // サーバーエラーを返す
        }
    });

    // 最近のトレーニング履歴を取得する API
    router.get('/recent/:id', async (req, res) => { // GET メソッドで /traininghistories/recent/:id にアクセスされた場合
        const userId = req.params.id; // URLパラメータから userid を取得
        const now = new Date(); // 現在時刻を取得
        const resetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 今日の0時を取得

        try {
            const result = await pool.query( // SQL クエリを実行
                'SELECT * FROM traininghistory WHERE userid = $1 AND created_at > $2 LIMIT 1;', // SQL クエリを実行
                [userId, resetTime] // 今日の0時以降の履歴を取得
            );
            if(result.rows.length > 0){ // 取得した行数が1以上の場合
                return res.status(200).json(result.rows[0]); // トレーニング履歴を返す
            } else  {
                return res.status(404).json();  // トレーニング履歴が見つからない場合
            }        
        } catch (error) {
            console.error('Failed to fetch recent training history:', error); // エラーログを出力
            return res.status(500).json({ error: 'Failed to fetch recent training history' }); // サーバーエラーを返す
        }
    });

    // トレーニング履歴を更新する API
    router.put('/:id', async (req, res) => { // PUT メソッドで /traininghistories/:id にアクセスされた場合
        const { trainingidlist, trainingHistoryId } = req.body; // リクエストボディから trainingidlist, trainingHistoryId を取得

        try {
            const result = await pool.query( // SQL クエリを実行
                'UPDATE traininghistory SET trainingidlist = $1 WHERE traininghistoryid = $2 RETURNING *', // SQL クエリを実行
                [trainingidlist, trainingHistoryId] // プレースホルダに指定された trainingidlist, trainingHistoryId をセット
            );

            if (result.rows.length === 0) { // 更新された行数が 0 の場合
                return res.status(404).json({ error: 'Training history not found' }); // ステータスコード 404 でエラーメッセージを返す
            }

            return res.status(200).json(result.rows[0]); // 更新されたトレーニング履歴を返す
        } catch (error) { // エラーが発生した場合
            console.error('Failed to update training history:', error); // エラーログを出力
            return res.status(500).json({ error: 'Failed to update training history' }); // サーバーエラーを返す
        }
    });

    // 全てのトレーニング履歴を取得する API
    router.get('/', async (req, res) => { // GET メソッドで /traininghistories にアクセスされた場合
        try {
            const result = await pool.query('SELECT * FROM traininghistory;'); // SQL クエリを実行
            return res.status(200).json(result.rows); // 全てのトレーニング履歴を返す
        } catch (error) { // エラーが発生した場合
            console.error('Failed to fetch training histories:', error); // エラーログを出力
            return res.status(500).json({ error: 'Failed to fetch training histories' }); // サーバーエラーを返す
        }
    });

    // 最後に router を返すことを忘れずに
    return router;
};
