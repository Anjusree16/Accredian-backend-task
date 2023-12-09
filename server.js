// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// User sign-up endpoint
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Hash the password before storing it in the database
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
    username,
    email,
    password: hashedPassword,
  };

  db.query('INSERT INTO users SET ?', user, (error, results) => {
    if (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      console.error('Database error during sign-up:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.status(201).json({ message: 'User signed up successfully' });
  });
});

// User login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
    if (error) {
      console.error('Database error during login:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful' });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
