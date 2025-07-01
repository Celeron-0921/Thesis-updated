const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = 3000;

// ✅ Middleware FIRST
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '@Depressed_123456',
  database: 'alumni_db',
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection failed:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// ✅ LOGIN route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM alumni WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('DB error during login:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];

    // ✅ If plain password (not hashed)
    if (user.password === password) {
      // Optionally exclude password before sending back
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json({ message: 'Login successful', user: userWithoutPassword });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});


// ✅ Register route
app.post('/api/register', (req, res) => {
  const {
    firstname, lastname, initial, username, degree,
    personal_email, year_started, year_graduated,
    password, phone_number, maiden_name, gender,
    civil_status, suffix, student_no
  } = req.body;

  const query = `
    INSERT INTO alumni (
      firstname, lastname, initial, username, degree,
      personal_email, year_started, year_graduated,
      password, phone_number, maiden_name, gender,
      civil_status, suffix, student_no
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    firstname, lastname, initial, username, degree,
    personal_email, year_started, year_graduated,
    password, phone_number, maiden_name, gender,
    civil_status, suffix, student_no
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ message: 'Database error' });
    } else {
      res.status(200).json({ message: 'Registration successful' });
    }
  });
});

// ✅ Profile retrieval route
app.get('/api/profile/:id', (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM alumni WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ message: 'Database error' });
    } else if (results.length === 0) {
      res.status(404).json({ message: 'Alumni not found' });
    } else {
      res.status(200).json(results[0]);
    }
  });
});

// ✅ Alumni list route
app.get('/api/alumni', (req, res) => {
  const sql = 'SELECT firstname, lastname, degree, year_graduated FROM alumni';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// ✅ Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
