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

// New endpoint: List all sessions
app.get('/api/sessions', (req, res) => {
  db.all(
    `SELECT sessions.*, 
     COUNT(tasks.id) as task_count,
     SUM(CASE WHEN tasks.completed = 1 THEN 1 ELSE 0 END) as completed_tasks
     FROM sessions 
     LEFT JOIN tasks ON sessions.id = tasks.session_id 
     GROUP BY sessions.id 
     ORDER BY sessions.start_time DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// New endpoint: Delete session by ID
app.delete('/api/sessions/:id', (req, res) => {
  const sessionId = req.params.id;
  
  // Begin transaction to ensure both operations complete or none do
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // First delete associated tasks
    db.run('DELETE FROM tasks WHERE session_id = ?', [sessionId], (err) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }
      
      // Then delete the session
      db.run('DELETE FROM sessions WHERE id = ?', [sessionId], function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }
        
        db.run('COMMIT');
        res.json({ 
          message: 'Session and associated tasks deleted successfully',
          changes: this.changes 
        });
      });
    });
  });
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

// New endpoint: Delete task by ID
app.delete('/api/tasks/:id', (req, res) => {
  db.run(
    'DELETE FROM tasks WHERE id = ?',
    [req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ 
        message: 'Task deleted successfully',
        changes: this.changes 
      });
    }
  );
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
