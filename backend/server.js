const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

// Funkcja do inicjalizacji bazy danych przy starcie serwera
const initializeDatabase = async () => {
  try {
    // Sprawdź, czy tabela 'users' istnieje
    await db.query("SELECT 'users'::regclass");
    console.log('Database already initialized.');
  } catch (error) {
    // Jeśli tabela nie istnieje, stwórz cały schemat
    console.log('Database not initialized. Creating schema...');
    const schema = `
      CREATE TABLE users (id SERIAL PRIMARY KEY, nickname TEXT NOT NULL UNIQUE, staticId TEXT, role TEXT, password TEXT, email TEXT NOT NULL UNIQUE);
      CREATE TABLE contracts (id SERIAL PRIMARY KEY, userId INTEGER, userNickname TEXT, contractType TEXT, detailedDescription TEXT, imageUrl TEXT, timestamp TEXT, isApproved BOOLEAN, isRejected BOOLEAN, payoutAmount REAL, rejectionReason TEXT);
      CREATE TABLE contract_config (name TEXT PRIMARY KEY, payout REAL);
      CREATE TABLE available_roles (name TEXT PRIMARY KEY, canViewThreads BOOLEAN, isThreadVisible BOOLEAN, canApprove BOOLEAN, canReject BOOLEAN);
    `;
    const liderPassword = await bcrypt.hash('1234', 10);
    const initialData = `
      INSERT INTO users (nickname, staticId, role, password, email) VALUES ('Gregory Tyler', '10001', 'Lider', '${liderPassword}', 'gregorytyler@rodzina.com');
      INSERT INTO contract_config (name, payout) VALUES ('Sprzedaż towaru', 25000), ('Haracz', 15000), ('Przerzut auta', 20000), ('Napad na sklep', 10000), ('sigma', 50000), ('Inne (opisz poniżej)', 5000);
      INSERT INTO available_roles (name, canViewThreads, isThreadVisible, canApprove, canReject) VALUES ('Lider', true, false, true, true), ('admin', true, false, true, false), ('member', false, true, false, false);
    `;
    await db.query(schema + initialData);
    console.log('Database schema and initial data created successfully.');
  }
};

// Middleware do weryfikacji tokenu JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- API Endpoints ---

app.post('/api/login', async (req, res) => {
    const { nickname, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE nickname = $1', [nickname]);
        const user = result.rows[0];
        if (!user) return res.status(400).send('Cannot find user');

        if (await bcrypt.compare(password, user.password)) {
            const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
            res.json({ token: accessToken, user: { id: user.id, nickname: user.nickname, role: user.role } });
        } else {
            res.status(401).send('Not Allowed');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/data', authenticateToken, async (req, res) => {
    try {
        const usersRes = await db.query("SELECT id, nickname, staticId, role FROM users");
        const contractsRes = await db.query("SELECT * FROM contracts ORDER BY timestamp DESC");
        const contractConfigRes = await db.query("SELECT * FROM contract_config");
        const availableRolesRes = await db.query("SELECT * FROM available_roles");

        res.json({
            users: usersRes.rows,
            contracts: contractsRes.rows,
            contractConfig: contractConfigRes.rows,
            availableRoles: availableRolesRes.rows,
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// ... (reszta endpointów API)

// Start serwera
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initializeDatabase();
});
