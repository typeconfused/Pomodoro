// backend/server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'pomodoro.db'));

// Create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      duration INTEGER,
      type TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER,
      description TEXT,
      completed BOOLEAN DEFAULT 0,
      FOREIGN KEY(session_id) REFERENCES sessions(id)
    )
  `);
});

// API Routes
app.post('/api/sessions', (req, res) => {
  const { duration, type } = req.body;
  db.run(
    'INSERT INTO sessions (duration, type) VALUES (?, ?)',
    [duration, type],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.post('/api/tasks', (req, res) => {
  const { sessionId, description } = req.body;
  db.run(
    'INSERT INTO tasks (session_id, description) VALUES (?, ?)',
    [sessionId, description],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/tasks/:id', (req, res) => {
  const { completed } = req.body;
  db.run(
    'UPDATE tasks SET completed = ? WHERE id = ?',
    [completed ? 1 : 0, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ changes: this.changes });
    }
  );
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Server is accessible at http://0.0.0.0:${port}`);
});
