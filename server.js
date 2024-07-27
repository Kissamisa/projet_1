const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(csurf({ cookie: true }));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
}));

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'garage_db'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database');
});

// CSRF Token Endpoint
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Routes
app.post('/api/signup', (req, res) => {
  const { lastname, firstname, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  const sql = 'INSERT INTO users (lastname, firstname, email, password) VALUES (?, ?, ?, ?)';
  db.query(sql, [lastname, firstname, email, hashedPassword], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }
    res.status(201).send('User registered');
  });
});

app.post('/api/signin', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('User not found');
      return;
    }

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      res.status(401).send('Invalid password');
      return;
    }

    const token = jwt.sign({ id: user.id }, 'secret-key', { expiresIn: 86400 });
    res.cookie('token', token, { httpOnly: true });
    res.status(200).send({ auth: true, token });
  });
});

// Protected Routes
app.get('/api/dashboard', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    console.error('Token not found in cookies');
    return res.status(401).send('Access Denied');
  }

  jwt.verify(token, 'secret-key', (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err);
      return res.status(401).send('Invalid Token');
    }

    res.send('Welcome to the Dashboard');
  });
});

app.get('/api/dashboard/stats', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('Access Denied');
  }

  jwt.verify(token, 'secret-key', (err, decoded) => {
    if (err) {
      return res.status(401).send('Invalid Token');
    }

    const sql = 'SELECT COUNT(*) AS client_count FROM client';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching client data:', err);
        return res.status(500).send('Server error');
      }

      res.json(results[0]);
    });
  });
});

app.get('/api/dashboard/clients', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('Access Denied');
  }

  jwt.verify(token, 'secret-key', (err, decoded) => {
    if (err) {
      return res.status(401).send('Invalid Token');
    }

    const sql = 'SELECT id,nom, prenom, age, voiture FROM client';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching client data:', err);
        return res.status(500).send('Server error');
      }
      res.json(results);
    });
  });
});
app.post('/api/clients/add', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('Access Denied');
  }

  jwt.verify(token, 'secret-key', (err, decoded) => {
    if (err) {
      return res.status(401).send('Invalid Token');
    }

    const userId = decoded.id; // Obtenez l'ID de l'utilisateur depuis le token
    const { nom, prenom, age, voiture } = req.body;

    // Vérifier que toutes les données sont présentes
    if (!nom || !prenom || !age || !voiture) {
      return res.status(400).send('All fields are required');
    }

    const sql = 'INSERT INTO client (nom, prenom, age, voiture, user_id) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nom, prenom, age, voiture, userId], (err, result) => {
      if (err) {
        console.error('Error adding client:', err);
        return res.status(500).send('Server error');
      }

      res.status(201).send('Client added');
    });
  });
});

// Route pour supprimer un client
app.post('/api/clients/delete', (req, res) => {
  console.log('Request body:', req.body); // Vérifiez les données reçues

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('Access Denied');
  }

  jwt.verify(token, 'secret-key', (err, decoded) => {
    if (err) {
      return res.status(401).send('Invalid Token');
    }

    const { clientId } = req.body;

    // Vérifiez que clientId est présent
    if (!clientId) {
      return res.status(400).send('Client ID is required');
    }

    const sql = 'DELETE FROM client WHERE id = ?';
    db.query(sql, [clientId], (err, result) => {
      if (err) {
        console.error('Error deleting client:', err);
        return res.status(500).send('Server error');
      }

      res.status(200).send('Client deleted');
    });
  });
});

app.post('/api/clients/update', (req, res) => {
  console.log('Request body:', req.body); // Vérifiez les données reçues

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('Access Denied');
  }

  jwt.verify(token, 'secret-key', (err, decoded) => {
    if (err) {
      return res.status(401).send('Invalid Token');
    }

    const { clientId, nom, prenom, age, voiture } = req.body;

    // Vérifiez que toutes les données sont présentes
    if (!clientId || !nom || !prenom || !age || !voiture) {
      return res.status(400).send('All fields are required');
    }

    const sql = 'UPDATE client SET nom = ?, prenom = ?, age = ?, voiture = ? WHERE id = ?';
    db.query(sql, [nom, prenom, age, voiture, clientId], (err, result) => {
      if (err) {
        console.error('Error updating client:', err);
        return res.status(500).send('Server error');
      }

      res.status(200).send('Client updated');
    });
  });
});

// Route pour obtenir les détails d'un client par ID
app.get('/api/clients/:id', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('Access Denied');
  }

  jwt.verify(token, 'secret-key', (err, decoded) => {
    if (err) {
      return res.status(401).send('Invalid Token');
    }

    const clientId = req.params.id;

    const sql = 'SELECT id, nom, prenom, age, voiture FROM client WHERE id = ?';
    db.query(sql, [clientId], (err, results) => {
      if (err) {
        console.error('Error fetching client data:', err);
        return res.status(500).send('Server error');
      }

      if (results.length === 0) {
        return res.status(404).send('Client not found');
      }

      res.json(results[0]);
    });
  });
});


app.use(express.static(path.join(__dirname, "./client/dist")));
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "./client/dist/index.html"));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
