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
    await db.query("SELECT 'users'::regclass");
    console.log('Database already initialized.');
  } catch (error) {
    console.log('Database not initialized. Creating schema...');
    const schema = `
      CREATE TABLE users (id SERIAL PRIMARY KEY, nickname TEXT NOT NULL UNIQUE, staticId TEXT, role TEXT, password TEXT);
      CREATE TABLE contracts (id SERIAL PRIMARY KEY, userId INTEGER, userNickname TEXT, contractType TEXT, detailedDescription TEXT, imageUrl TEXT, timestamp TEXT, isApproved BOOLEAN DEFAULT false, isRejected BOOLEAN DEFAULT false, payoutAmount REAL, rejectionReason TEXT);
      CREATE TABLE contract_config (name TEXT PRIMARY KEY, payout REAL);
      CREATE TABLE available_roles (name TEXT PRIMARY KEY, canViewThreads BOOLEAN, isThreadVisible BOOLEAN, canApprove BOOLEAN, canReject BOOLEAN);
    `;
    const liderPassword = await bcrypt.hash('1234', 10);
    const initialData = `
      INSERT INTO users (nickname, staticId, role, password) VALUES ('Gregory Tyler', '10001', 'Lider', '${liderPassword}');
      INSERT INTO contract_config (name, payout) VALUES ('Sprzedaż towaru', 25000), ('Haracz', 15000), ('Przerzut auta', 20000);
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

app.post('/api/settings', authenticateToken, async (req, res) => {
    if (req.user.role !== 'Lider') return res.sendStatus(403);
    
    const { users, contractConfig, availableRoles } = req.body;
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        const dbUsersResult = await client.query('SELECT id FROM users');
        const dbUserIds = dbUsersResult.rows.map(u => u.id);
        const incomingUserIds = users.filter(u => typeof u.id === 'number').map(u => u.id);

        // Usuwanie użytkowników
        for (const dbId of dbUserIds) {
            if (!incomingUserIds.includes(dbId)) {
                await client.query('DELETE FROM users WHERE id = $1', [dbId]);
            }
        }

        // Aktualizacja i dodawanie użytkowników
        for (const user of users) {
             if (user.id.toString().startsWith('new-')) {
                const hashedPassword = await bcrypt.hash(user.password || '1234', 10);
                await client.query('INSERT INTO users (nickname, staticid, role, password) VALUES ($1, $2, $3, $4)', 
                [user.nickname, user.staticid, user.role, hashedPassword]);
            } else {
                if (user.password && user.password.length > 0) {
                    const hashedPassword = await bcrypt.hash(user.password, 10);
                    await client.query('UPDATE users SET staticid = $1, role = $2, password = $3 WHERE id = $4', 
                    [user.staticid, user.role, hashedPassword, user.id]);
                } else {
                    await client.query('UPDATE users SET staticid = $1, role = $2 WHERE id = $3', 
                    [user.staticid, user.role, user.id]);
                }
            }
        }

        await client.query('DELETE FROM available_roles');
        for (const role of availableRoles) {
            await client.query('INSERT INTO available_roles (name, canviewthreads, isthreadvisible, canapprove, canreject) VALUES ($1, $2, $3, $4, $5)',
            [role.name, role.canviewthreads, role.isthreadvisible, role.canapprove, role.canreject]);
        }
        
        await client.query('DELETE FROM contract_config');
        for (const config of contractConfig) {
            await client.query('INSERT INTO contract_config (name, payout) VALUES ($1, $2)', [config.name, config.payout]);
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true });
    } catch (e) {
        await client.query('ROLLBACK');
        res.status(500).send(e.message);
    } finally {
        client.release();
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
