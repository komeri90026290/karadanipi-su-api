require('dotenv').config();  // dotenv パッケージを使って環境変数を読み込む

const express = require('express');
const { Pool } = require('pg');  // PostgreSQL 用のパッケージ


// Express アプリケーションを設定
const app = express();
const port = 3000;

// PostgreSQL に接続するためのプールを設定
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: { rejectUnauthorized: false },  // Render の PostgreSQL で必要
});

app.use(express.json());  // リクエストボディの JSON パースを有効にする

const cors =require('cors');
app.use(cors({
  origin: '*'
}));
// ユーザーを追加する API
app.post('/users', async (req, res) => {
  const { username,password,height,weight } = req.body;  // リクエストボディから名前とメールアドレスを取得
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password, height, weight) VALUES ($1, $2, $3, $4) RETURNING *', 
      [username, password, height, weight]
    );
    return res.status(201).json(result.rows[0]);  // 新しく追加されたユーザーを返す
  } catch (error) {
    console.error('Failed to add user:', error);
    return res.status(500).json({ error: 'Failed to add user' });
  }
});

// ユーザー一覧を取得する API
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users;');
    return res.status(200).json(result.rows);  // すべてのユーザーを返す
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});


app.post('/login', async (req, res) => {
      const { username, password } = req.body;    
      try {      const result = await pool.query(        
        'SELECT * FROM users WHERE username = $1 AND password = $2',         
        [username, password]      
      );      
      if (result.rows.length > 0) {        
        return res.status(200).json({ message: 'ログイン成功', userId: result.rows[0].userid });      
      } else {        
        return res.status(401).json({ error: 'ユーザー名またはパスワードが正しくありません' });      
      }    
    } catch (error) {      
      console.error('Failed to login:', error);      
      return res.status(500).json({ error: 'Failed to login' });    
    }  
  });

// フードを追加する API
app.post('/food', async (req, res) => {
  const { userid,breakfast,lunch,dinner } = req.body;  // リクエストボディから名前とメールアドレスを取得
    // デバッグ用にリクエストデータを確認
    console.log("Request Body:", req.body);
  try {
    const result = await pool.query(
      'INSERT INTO food (userid,breakfast,lunch,dinner) VALUES ($1, $2, $3, $4) RETURNING *',
      [userid, breakfast, lunch, dinner]
    );
    return res.status(201).json(result.rows[0]);  // 新しく追加されたユーザーを返す
  } catch (error) {
    console.error('Failed to add food:', error);
    return res.status(500).json({ error: 'Failed to add food' });
  }
});


// サーバーを起動
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});