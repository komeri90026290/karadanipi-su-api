require('dotenv').config();  // dotenv パッケージを使って環境変数を読み込む

const express = require('express');
const { Pool } = require('pg');  // PostgreSQL 用のパッケージ
const cors =require('cors');


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

app.use(cors({
    origin: ['https://karadanipi-su-api.onrender.com', 'http://localhost:3000']
  }));
// ユーザーを追加する API
app.post('/test', async (req, res) => {
  const { username,password,height,weight } = req.body;  // リクエストボディから名前とメールアドレスを取得
  try {
    const result = await pool.query(
      'INSERT INTO test (username, password, height, weight) VALUES ($1, $2, $3, $4) RETURNING *', 
      [username, password, height, weight]
    );
    return res.status(201).json(result.rows[0]);  // 新しく追加されたユーザーを返す
  } catch (error) {
    console.error('Failed to add user:', error);
    return res.status(500).json({ error: 'Failed to add user' });
  }
});

// ユーザー一覧を取得する API
app.get('/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM test');
    return res.status(200).json(result.rows);  // すべてのユーザーを返す
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// サーバーを起動
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});