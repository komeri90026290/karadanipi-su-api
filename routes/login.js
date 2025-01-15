const express = require('express'); // express モジュールを読み込む
const router = express.Router(); // express の Router オブジェクトを取得

module.exports = (pool) => { // このファイルがモジュールとして読み込まれた際に関数をエクスポートする
  router.post('/', async (req, res) => { // POST メソッドで /login にアクセスされた場合
    const { username, password } = req.body; // リクエストボディから username, password を取得
    try {
      const result = await pool.query( // SQL クエリを実行
        'SELECT * FROM users WHERE username = $1 AND password = $2', // users テーブルから username と password が一致する行を取得
        [username, password] // プレースホルダに指定された username と password をセット
      );
      if (result.rows.length > 0) { // 取得した行数が 1 以上の場合
        return res.status(200).json({ message: 'ログイン成功', userId: result.rows[0].userid }); // ステータスコード 200 でログイン成功メッセージとユーザーIDを返す
      } else {
        return res.status(401).json({ error: 'ユーザー名またはパスワードが正しくありません' }); // ステータスコード 401 でエラーメッセージを返す
      }
    } catch (error) {
      console.error('Failed to login:', error); // エラーログを出力
      return res.status(500).json({ error: 'Failed to login' }); // ステータスコード 500 でエラーメッセージを返す
    }
  });

  return router;
};
