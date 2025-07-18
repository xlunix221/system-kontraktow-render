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


// ===================================================================================
//
//       TWOJE CENTRUM ZARZĄDZANIA - EDYTUJ WSZYSTKO PONIŻEJ
//
// ===================================================================================

const initialConfig = {
  // --- EDYTUJ LISTĘ UŻYTKOWNIKÓW ---
  users: [
    { nickname: 'Gregory Tyler', staticId: '10001', role: 'Lider', password: '1512' },
    { nickname: 'Scott Boner', staticId: '83913', role: 'V-lider', password: '1234' },
    { nickname: 'Scott Boner1', staticId: '83913', role: 'member', password: '1234' },
    // Aby dodać nowego użytkownika, skopiuj powyższą linijkę i zmień dane.
    // Przykład: { nickname: 'NowyKolega', staticId: '55555', role: 'member', password: 'nowehaslo' },
  ],

  // --- EDYTUJ ROLE I ICH UPRAWNIENIA ---
  availableRoles: [
      { name: 'Lider', canViewThreads: true, isThreadVisible: false, canApprove: true, canReject: true },
      { name: 'V-lider', canViewThreads: false, isThreadVisible: true, canApprove: true, canReject: true },
      { name: 'admin', canViewThreads: true, isThreadVisible: true, canApprove: true, canReject: false },
     { name: 'member', canViewThreads: false, isThreadVisible: true, canApprove: false, canReject: false },
  ],

  // --- EDYTUJ TYPY KONTRAKTÓW I WYPŁATY ---
  contractConfig: [
    { name: 'Sprzedaż towaru', payout: 25000 },
    { name: 'Haracz', payout: 15000 },
    { name: 'Przerzut auta', payout: 20000 },
    { name: 'Napad na sklep', payout: 10000 },
    { name: 'sigma', payout: 50000 },
    { name: 'Inne (opisz poniżej)', payout: 5000 },
  ]
};

// ===================================================================================
//
//       KONIEC SEKCJI ZARZĄDZANIA - NIE EDYTUJ NIC PONIŻEJ
//
// ===================================================================================


// Funkcja do inicjalizacji bazy danych przy starcie serwera
const initializeDatabase = async () => {
  const client = await db.pool.connect();
  try {
    console.log('Force re-initializing database with new config...');
    
    // Czyszczenie starych tabel
    await client.query('DROP TABLE IF EXISTS users, contracts, contract_config, available_roles;');

    // Tworzenie nowego schematu
    const schema = `
      CREATE TABLE users (id SERIAL PRIMARY KEY, nickname TEXT NOT NULL UNIQUE, staticId TEXT, role TEXT, password TEXT);
      CREATE TABLE contracts (id SERIAL PRIMARY KEY, userId INTEGER, userNickname TEXT, contractType TEXT, detailedDescription TEXT, imageUrl TEXT, timestamp TEXT, isApproved BOOLEAN DEFAULT false, isRejected BOOLEAN DEFAULT false, payoutAmount REAL, rejectionReason TEXT);
      CREATE TABLE contract_config (name TEXT PRIMARY KEY, payout REAL);
      CREATE TABLE available_roles (name TEXT PRIMARY KEY, canViewThreads BOOLEAN, isThreadVisible BOOLEAN, canApprove BOOLEAN, canReject BOOLEAN);
    `;
    await client.query(schema);

    // Wstawianie nowych danych
    for (const user of initialConfig.users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await client.query('INSERT INTO users (nickname, staticId, role, password) VALUES ($1, $2, $3, $4)', 
        [user.nickname, user.staticId, user.role, hashedPassword]);
    }
    for (const role of initialConfig.availableRoles) {
        await client.query('INSERT INTO available_roles (name, canViewThreads, isThreadVisible, canApprove, canReject) VALUES ($1, $2, $3, $4, $5)',
        [role.name, role.canViewThreads, role.isThreadVisible, role.canApprove, role.canReject]);
    }
    for (const config of initialConfig.contractConfig) {
        await client.query('INSERT INTO contract_config (name, payout) VALUES ($1, $2)', [config.name, config.payout]);
    }

    console.log('Database schema and initial data created successfully.');
  } catch (err) {
      console.error('Database initialization error:', err);
  } finally {
      client.release();
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
            res.json({ token: accessToken, user });
        } else {
            res.status(401).send('Not Allowed');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/data', authenticateToken, async (req, res) => {
    try {
        const usersRes = await db.query("SELECT id, nickname, staticid, role FROM users");
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

app.post('/api/contracts', authenticateToken, async (req, res) => {
    const { userId, userNickname, contractType, detailedDescription, imageUrl } = req.body;
    const timestamp = new Date().toISOString();
    try {
        await db.query('INSERT INTO contracts (userid, usernickname, contracttype, detaileddescription, imageurl, timestamp) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, userNickname, contractType, detailedDescription, imageUrl, timestamp]);
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.put('/api/contracts/:id/:action', authenticateToken, async (req, res) => {
    const { id, action } = req.params;
    try {
        if (action === 'approve') {
            const { payoutAmount } = req.body;
            await db.query('UPDATE contracts SET isapproved = true, isrejected = false, payoutamount = $1 WHERE id = $2', [payoutAmount, id]);
        } else if (action === 'reject') {
            const { rejectionReason } = req.body;
            await db.query('UPDATE contracts SET isrejected = true, isapproved = false, rejectionreason = $1 WHERE id = $2', [rejectionReason, id]);
        } else {
            return res.status(400).send('Invalid action');
        }
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initializeDatabase();
});
