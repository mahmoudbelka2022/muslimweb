const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const app = express();
dotenv.config();


// const pool = new Pool({
//         user: 'hr',
//         host: 'room-reservation-qa.cxvqfpt4mc2y.us-east-1.rds.amazonaws.com',
//         database: 'hr',
//         password: 'hr',
//         port: 5432,
// });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: false }));

// Set view engine to EJS
app.set('view engine', 'ejs');

// Homepage Route
app.get('/', (req, res) => {
  res.render('index');
});

// Register Page
// app.get('/register', (req, res) => {
//   res.render('register');
// });
//
// // Handle Registration
// app.post('/register', async (req, res) => {
//   const { username, email, password } = req.body;
//
//   if (!username || !email || !password) {
//     return res.status(400).send('All fields are required.');
//   }
//
//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const query = 'INSERT INTO usersislam (username, email, password) VALUES ($1, $2, $3) RETURNING *';
//     const result = await pool.query(query, [username, email, hashedPassword]);
//
//     req.session.username = username;
//     res.redirect('/dashboard');
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error registering user.');
//   }
// });

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/register");
  });

  app.post('/register', async (req, res) => {
    const pool = new Pool({
      host : process.env.DB_HOST,
      port : process.env.DB_PORT,
      user : process.env.DB_USER,
      password : process.env.DB_PASSWORD,
      database : process.env.DB_NAME,

});
  await client.connect();

   const { username, email, password } = req.body;

   const result = await client.query(
  'INSERT INTO usersislam (username, email, password) VALUES ($1, $2, $3)',[username, email, password]
);

   await client.end();
   console.log("Data inserted successfully");
   res.redirect('/dashboard.ejs');
});

// Login Page
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = 'SELECT * FROM usersislam WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        req.session.username = user.username;
        res.redirect('/dashboard');
      } else {
        res.status(400).send('Invalid email or password.');
      }
    } else {
      res.status(400).send('User not found.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in.');
  }
});

// Dashboard Page (protected)
app.get('/dashboard', (req, res) => {
  if (!req.session.username) {
    return res.redirect('/login');
  }

  res.render('dashboard', { username: req.session.username });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
