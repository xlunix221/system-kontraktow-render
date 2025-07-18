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
  maintenanceMode: false,
  users: [
    { nickname: 'Gregory Tyler', staticId: '24032', role: '[7] Lider', password: 'Franiu225!' },
    { nickname: 'Tylor Smith', staticId: '63038', role: '[6] V-lider', password: 'lubiewdupe8321' },
    { nickname: 'Myster Czapa', staticId: '26856', role: '[6] V-lider', password: 'Jarek@fangs' },
    { nickname: 'Genki Teshmio', staticId: '125852', role: '[1] New Member', password: 'superauto123' },
  ],
  availableRoles: [
    { name: '[7] Lider', priority: 1, canViewThreads: true, isThreadVisible: false, canApprove: true, canReject: true },
    { name: '[6] V-lider', priority: 2, canViewThreads: true, isThreadVisible: true, canApprove: true, canReject: true },
    { name: '[5] Management', priority: 3, canViewThreads: true, isThreadVisible: true, canApprove: true, canReject: false },
    { name: '[4] OG Member', priority: 4, canViewThreads: false, isThreadVisible: true, canApprove: false, canReject: false },
    { name: '[3] Member +', priority: 5, canViewThreads: false, isThreadVisible: true, canApprove: false, canReject: false },
    { name: '[2] Member', priority: 6, canViewThreads: false, isThreadVisible: true, canApprove: false, canReject: false },
    { name: '[1] New Member', priority: 7, canViewThreads: false, isThreadVisible: true, canApprove: false, canReject: false },
  ],
  contractConfig: [
    { name: 'Inne (opisz poniżej)', payout: 5000 },
  ],
  changelog: [
    { 
      version: 'v1.5.0', 
      date: '2025-07-18', 
      changes: ['Dodano nowe role!'] 
    },
    { 
      version: 'v1.4.0', 
      date: '2025-07-18', 
      changes: [
        'Dodano animacje wysuwania sekcji w panelu bocznym.',
        'Wyświetlanie ostatniego changeloga na stronie logowania.',
      ] 
    },
    { 
      version: 'v1.3.0', 
      date: '2025-07-18', 
      changes: [
        'Odświeżono wygląd całej aplikacji, wprowadzając nowoczesny, ciemny motyw.',
        'Dodano fioletowe, świecące akcenty, aby poprawić estetykę interfejsu.',
        'Ulepszono interaktywność elementów (przyciski, karty, pola formularzy).',
      ] 
    },
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
    console.log('Initializing database...');
    
    await client.query('DROP TABLE IF EXISTS users, contracts, contract_config, available_roles;');

    const schema = `
      CREATE TABLE users (id SERIAL PRIMARY KEY, nickname TEXT NOT NULL UNIQUE, staticId TEXT, role TEXT, password TEXT);
      CREATE TABLE contracts (id SERIAL PRIMARY KEY, userId INTEGER, userNickname TEXT, contractType TEXT, detailedDescription TEXT, imageUrl TEXT, timestamp TEXT, isApproved BOOLEAN DEFAULT false, isRejected BOOLEAN DEFAULT false, payoutAmount REAL, rejectionReason TEXT);
      CREATE TABLE contract_config (name TEXT PRIMARY KEY, payout REAL);
      CREATE TABLE available_roles (name TEXT PRIMARY KEY, priority INTEGER, canViewThreads BOOLEAN, isThreadVisible BOOLEAN, canApprove BOOLEAN, canReject BOOLEAN);
    `;
    await client.query(schema);

    for (const user of initialConfig.users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await client.query('INSERT INTO users (nickname, staticId, role, password) VALUES ($1, $2, $3, $4)', 
        [user.nickname, user.staticId, user.role, hashedPassword]);
    }
    for (const role of initialConfig.availableRoles) {
        await client.query('INSERT INTO available_roles (name, priority, canViewThreads, isThreadVisible, canApprove, canReject) VALUES ($1, $2, $3, $4, $5, $6)',
        [role.name, role.priority, role.canViewThreads, role.isThreadVisible, role.canApprove, role.canReject]);
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
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) return res.sendStatus(403);
        
        try {
            const userResult = await db.query('SELECT role FROM users WHERE id = $1', [decoded.id]);
            if (userResult.rows.length === 0) return res.sendStatus(403);
            const userRole = userResult.rows[0].role;
            
            const roleResult = await db.query('SELECT * FROM available_roles WHERE name = $1', [userRole]);
            if (roleResult.rows.length === 0) return res.sendStatus(403);

            req.user = {
                id: decoded.id,
                role: userRole,
                permissions: roleResult.rows[0]
            };
            next();
        } catch (dbErr) {
            res.status(500).send(dbErr.message);
        }
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
            const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });
            res.json({ token: accessToken });
        } else {
            res.status(401).send('Not Allowed');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// NOWY, PUBLICZNY ENDPOINT
app.get('/api/changelog/latest', (req, res) => {
    if (initialConfig.changelog && initialConfig.changelog.length > 0) {
        res.json(initialConfig.changelog[0]); // Zwróć tylko pierwszy (najnowszy) element
    } else {
        res.status(404).json({ message: 'Changelog not found' });
    }
});


app.get('/api/data', authenticateToken, async (req, res) => {
    try {
        const usersQuery = `
            SELECT u.id, u.nickname, u.staticid, u.role
            FROM users u
            JOIN available_roles ar ON u.role = ar.name
            ORDER BY ar.priority ASC, u.nickname ASC;
        `;
        const usersRes = await db.query(usersQuery);
        const contractsRes = await db.query("SELECT * FROM contracts ORDER BY timestamp DESC");
        const contractConfigRes = await db.query("SELECT * FROM contract_config");
        const availableRolesRes = await db.query("SELECT * FROM available_roles");

        res.json({
            users: usersRes.rows,
            contracts: contractsRes.rows,
            contractConfig: contractConfigRes.rows,
            availableRoles: availableRolesRes.rows,
            changelog: initialConfig.changelog,
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/api/contracts', authenticateToken, async (req, res) => {
    if (!req.user.permissions.isthreadvisible) return res.status(403).send('Brak uprawnień do dodawania kontraktów.');

    const { userNickname, contractType, detailedDescription, imageUrl } = req.body;
    const timestamp = new Date().toISOString();
    try {
        await db.query('INSERT INTO contracts (userid, usernickname, contracttype, detaileddescription, imageurl, timestamp) VALUES ($1, $2, $3, $4, $5, $6)',
        [req.user.id, userNickname, contractType, detailedDescription, imageUrl, timestamp]);
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.put('/api/contracts/:id/:action', authenticateToken, async (req, res) => {
    const { id, action } = req.params;
    try {
        if (action === 'approve') {
            if (!req.user.permissions.canapprove) return res.status(403).send('Brak uprawnień do zatwierdzania.');
            const { payoutAmount } = req.body;
            await db.query('UPDATE contracts SET isapproved = true, isrejected = false, payoutamount = $1 WHERE id = $2', [payoutAmount, id]);
        } else if (action === 'reject') {
            if (!req.user.permissions.canreject) return res.status(403).send('Brak uprawnień do odrzucania.');
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

// NEW ENDPOINT
app.get('/api/maintenance', (req, res) => {
  res.json({ maintenance: initialConfig.maintenanceMode });
});
