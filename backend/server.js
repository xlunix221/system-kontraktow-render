const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();
const path = require('path');

// Multer jest potrzebny do przetwarzania plików
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

// Konfiguracja multer do przechowywania plików w pamięci
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// ===================================================================================
//
//       TWOJE CENTRUM ZARZĄDZANIA - EDYTUJ WSZYSTKO PONIŻEJ
//
// ===================================================================================

const initialConfig = {
  users: [
    { nickname: 'Gregory Tyler', staticId: '24032', role: '[7] Lider', password: 'Franiu225!' },
  ],
  availableRoles: [
    { name: '[7] Lider', priority: 1, canViewThreads: true, isThreadVisible: true, canApprove: true, canReject: true, canDelete: true },
    { name: '[6] V-lider', priority: 2, canViewThreads: true, isThreadVisible: true, canApprove: true, canReject: true, canDelete: true },
    { name: '[5] Management', priority: 3, canViewThreads: true, isThreadVisible: true, canApprove: true, canReject: false, canDelete: true },
    { name: '[4] OG Member', priority: 4, canViewThreads: false, isThreadVisible: true, canApprove: false, canReject: false, canDelete: false },
    { name: '[3] Member +', priority: 5, canViewThreads: false, isThreadVisible: true, canApprove: false, canReject: false, canDelete: false },
    { name: '[2] Member', priority: 6, canViewThreads: false, isThreadVisible: true, canApprove: false, canReject: false, canDelete: false },
    { name: '[1] New Member', priority: 7, canViewThreads: false, isThreadVisible: true, canApprove: false, canReject: false, canDelete: false },
  ],
  contractConfig: [
    { name: 'Inne (opisz poniżej)', payout: 5000 },
  ],
  changelog: [
    { 
      version: 'v2.1.0', 
      date: '2025-07-20', 
      changes: [
        'Dodano możliwość zmiany hasła przez użytkownika w panelu.',
      ]
    },
    { 
      version: 'v2.0.0', 
      date: '2025-07-20', 
      changes: [
        'Wdrożono Panel Administracyjny dla Lidera.',
        'Dodano Dashboard ze statystykami.',
        'Wprowadzono filtrowanie i wyszukiwanie kontraktów.',
        'Dodano system powiadomień i historię akcji.',
      ]
    },
    { 
      version: 'v1.6.0', 
      date: '2025-07-18', 
      changes: [
        'Naprawiono dodawanie zdjec!',
        'Dodano możliwość usuwania wiadomości przez administracje!'
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
    
    await client.query('DROP TABLE IF EXISTS users, contracts, contract_config, available_roles, action_logs, notifications;');

    const schema = `
      CREATE TABLE users (id SERIAL PRIMARY KEY, nickname TEXT NOT NULL UNIQUE, staticId TEXT, role TEXT, password TEXT);
      CREATE TABLE contracts (
          id SERIAL PRIMARY KEY, 
          userId INTEGER, 
          userNickname TEXT, 
          contractType TEXT, 
          detailedDescription TEXT, 
          imageData BYTEA, 
          imageMimeType TEXT, 
          timestamp TEXT, 
          isApproved BOOLEAN DEFAULT false, 
          isRejected BOOLEAN DEFAULT false, 
          payoutAmount REAL, 
          rejectionReason TEXT
      );
      CREATE TABLE contract_config (name TEXT PRIMARY KEY, payout REAL);
      CREATE TABLE available_roles (name TEXT PRIMARY KEY, priority INTEGER, canViewThreads BOOLEAN, isThreadVisible BOOLEAN, canApprove BOOLEAN, canReject BOOLEAN, canDelete BOOLEAN);
      CREATE TABLE action_logs (id SERIAL PRIMARY KEY, timestamp TIMESTAMPTZ DEFAULT NOW(), actor_nickname TEXT, action_description TEXT);
      CREATE TABLE notifications (id SERIAL PRIMARY KEY, user_id INTEGER, message TEXT, is_read BOOLEAN DEFAULT false, timestamp TIMESTAMPTZ DEFAULT NOW());
    `;
    await client.query(schema);

    for (const user of initialConfig.users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await client.query('INSERT INTO users (nickname, staticId, role, password) VALUES ($1, $2, $3, $4)', 
        [user.nickname, user.staticId, user.role, hashedPassword]);
    }
    for (const role of initialConfig.availableRoles) {
        await client.query('INSERT INTO available_roles (name, priority, canViewThreads, isThreadVisible, canApprove, canReject, canDelete) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [role.name, role.priority, role.canViewThreads, role.isThreadVisible, role.canApprove, role.canReject, role.canDelete]);
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

// Helpery do logowania i powiadomień
const createLog = async (actorNickname, actionDescription) => {
    await db.query('INSERT INTO action_logs (actor_nickname, action_description) VALUES ($1, $2)', [actorNickname, actionDescription]);
};
const createNotification = async (userId, message) => {
    await db.query('INSERT INTO notifications (user_id, message) VALUES ($1, $2)', [userId, message]);
};


// Middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) return res.sendStatus(403);
        
        try {
            const userResult = await db.query('SELECT nickname, role FROM users WHERE id = $1', [decoded.id]);
            if (userResult.rows.length === 0) return res.sendStatus(403);
            const { nickname, role } = userResult.rows[0];
            
            const roleResult = await db.query('SELECT * FROM available_roles WHERE name = $1', [role]);
            if (roleResult.rows.length === 0) return res.sendStatus(403);

            req.user = {
                id: decoded.id,
                nickname: nickname,
                role: role,
                permissions: roleResult.rows[0]
            };
            next();
        } catch (dbErr) {
            res.status(500).send(dbErr.message);
        }
    });
};

const requireLeader = (req, res, next) => {
    if (req.user.role !== '[7] Lider') {
        return res.status(403).send('Brak uprawnień. Wymagana rola Lidera.');
    }
    next();
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

app.get('/api/changelog/latest', (req, res) => {
    if (initialConfig.changelog && initialConfig.changelog.length > 0) {
        res.json(initialConfig.changelog[0]);
    } else {
        res.status(404).json({ message: 'Changelog not found' });
    }
});


app.get('/api/data', authenticateToken, async (req, res) => {
    try {
        const usersQuery = `SELECT u.id, u.nickname, u.staticid, u.role FROM users u JOIN available_roles ar ON u.role = ar.name ORDER BY ar.priority ASC, u.nickname ASC;`;
        const usersRes = await db.query(usersQuery);
        const contractsRes = await db.query("SELECT id, userid, usernickname, contracttype, detaileddescription, timestamp, isapproved, isrejected, payoutamount, rejectionreason FROM contracts ORDER BY timestamp DESC");
        const contractConfigRes = await db.query("SELECT * FROM contract_config");
        const availableRolesRes = await db.query("SELECT * FROM available_roles ORDER BY priority ASC");
        const notificationsRes = await db.query("SELECT * FROM notifications WHERE user_id = $1 AND is_read = false ORDER BY timestamp DESC", [req.user.id]);
        
        let logsRes = { rows: [] };
        if (req.user.role === '[7] Lider') {
            logsRes = await db.query("SELECT * FROM action_logs ORDER BY timestamp DESC LIMIT 50");
        }

        res.json({
            users: usersRes.rows,
            contracts: contractsRes.rows,
            contractConfig: contractConfigRes.rows,
            availableRoles: availableRolesRes.rows,
            changelog: initialConfig.changelog,
            notifications: notificationsRes.rows,
            logs: logsRes.rows
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/api/contracts', authenticateToken, upload.single('image'), async (req, res) => {
    if (!req.user.permissions.isthreadvisible) return res.status(403).send('Brak uprawnień do dodawania kontraktów.');

    const { userNickname, contractType, detailedDescription } = req.body;
    const timestamp = new Date().toISOString();

    if (!req.file) return res.status(400).send('No image file provided.');
    
    const imageData = req.file.buffer;
    const imageMimeType = req.file.mimetype;

    try {
        await db.query(
            'INSERT INTO contracts (userid, usernickname, contracttype, detaileddescription, imagedata, imagemimetype, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [req.user.id, userNickname, contractType, detailedDescription, imageData, imageMimeType, timestamp]
        );
        
        await createLog(req.user.nickname, `dodał nowy kontrakt typu "${contractType}".`);
        
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.put('/api/contracts/:id/:action', authenticateToken, async (req, res) => {
    const { id, action } = req.params;
    try {
        const contractRes = await db.query('SELECT * FROM contracts WHERE id = $1', [id]);
        if(contractRes.rows.length === 0) return res.status(404).send('Contract not found');
        const contract = contractRes.rows[0];

        if (action === 'approve') {
            if (!req.user.permissions.canapprove) return res.status(403).send('Brak uprawnień do zatwierdzania.');
            const { payoutAmount } = req.body;
            await db.query('UPDATE contracts SET isapproved = true, isrejected = false, payoutamount = $1 WHERE id = $2', [payoutAmount, id]);
            await createLog(req.user.nickname, `zatwierdził kontrakt #${id} (${contract.contracttype}) użytkownika ${contract.usernickname}.`);
            await createNotification(contract.userid, `Twój kontrakt "${contract.contracttype}" został zatwierdzony.`);
        } else if (action === 'reject') {
            if (!req.user.permissions.canreject) return res.status(403).send('Brak uprawnień do odrzucania.');
            const { rejectionReason } = req.body;
            await db.query('UPDATE contracts SET isrejected = true, isapproved = false, rejectionreason = $1 WHERE id = $2', [rejectionReason, id]);
            await createLog(req.user.nickname, `odrzucił kontrakt #${id} (${contract.contracttype}) użytkownika ${contract.usernickname}.`);
            await createNotification(contract.userid, `Twój kontrakt "${contract.contracttype}" został odrzucony.`);
        } else {
            return res.status(400).send('Invalid action');
        }
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.delete('/api/contracts/:id', authenticateToken, async (req, res) => {
    if (!req.user.permissions.candelete) return res.status(403).send('Brak uprawnień do usuwania kontraktów.');

    const { id } = req.params;
    try {
        const contractRes = await db.query('SELECT * FROM contracts WHERE id = $1', [id]);
        if(contractRes.rows.length === 0) return res.status(404).send('Contract not found');
        const contract = contractRes.rows[0];

        const deleteResult = await db.query('DELETE FROM contracts WHERE id = $1', [id]);
        if (deleteResult.rowCount === 0) return res.status(404).send('Contract not found');

        await createLog(req.user.nickname, `usunął kontrakt #${id} (${contract.contracttype}) użytkownika ${contract.usernickname}.`);
        res.status(200).json({ success: true, message: 'Contract deleted successfully' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});


app.get('/api/images/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT imagedata, imagemimetype FROM contracts WHERE id = $1', [id]);

        if (result.rows.length > 0) {
            const img = result.rows[0];
            res.setHeader('Content-Type', img.imagemimetype);
            res.send(img.imagedata);
        } else {
            res.status(404).send('Image not found');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.put('/api/user/password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const userNickname = req.user.nickname;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Proszę podać obecne i nowe hasło.' });
    }

    try {
        // Pobierz aktualne hasło użytkownika z bazy
        const userResult = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).send('User not found');
        }
        const user = userResult.rows[0];

        // Porównaj podane obecne hasło z hasłem w bazie
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(403).json({ success: false, message: 'Obecne hasło jest nieprawidłowe.' });
        }

        // Hashuj nowe hasło
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Zaktualizuj hasło w bazie danych
        await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedNewPassword, userId]);

        // Zapisz log akcji
        await createLog(userNickname, 'zmienił swoje hasło.');

        res.status(200).json({ success: true, message: 'Hasło zostało pomyślnie zmienione.' });
    } catch (err) {
        console.error('Password change error:', err);
        res.status(500).json({ success: false, message: 'Wystąpił błąd serwera.' });
    }
});

// --- NOWE ENDPOINTY ADMINISTRACYJNE ---
app.use('/api/admin', authenticateToken, requireLeader); // Middleware dla wszystkich ścieżek admina

app.post('/api/admin/users', async (req, res) => {
    const { nickname, staticId, role, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (nickname, staticId, role, password) VALUES ($1, $2, $3, $4)', [nickname, staticId, role, hashedPassword]);
        await createLog(req.user.nickname, `dodał nowego użytkownika: ${nickname}.`);
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/admin/users/:id', async (req, res) => {
    const { id } = req.params;
    const { staticId, role } = req.body;
    try {
        await db.query('UPDATE users SET staticId = $1, role = $2 WHERE id = $3', [staticId, role, id]);
        await createLog(req.user.nickname, `zaktualizował dane użytkownika o ID #${id}.`);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/api/admin/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const userRes = await db.query('SELECT nickname FROM users WHERE id = $1', [id]);
        if(userRes.rows.length === 0) return res.status(404).send('User not found');
        const nickname = userRes.rows[0].nickname;

        await db.query('DELETE FROM users WHERE id = $1', [id]);
        await createLog(req.user.nickname, `usunął użytkownika: ${nickname}.`);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/admin/config', async (req, res) => {
    const { availableRoles, contractConfig } = req.body;
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN'); // Start transakcji
        
        await client.query('DELETE FROM available_roles');
        for (const role of availableRoles) {
            await client.query('INSERT INTO available_roles (name, priority, canViewThreads, isThreadVisible, canApprove, canReject, canDelete) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [role.name, role.priority, role.canviewthreads, role.isthreadvisible, role.canapprove, role.canreject, role.candelete]);
        }

        await client.query('DELETE FROM contract_config');
        for (const config of contractConfig) {
            await client.query('INSERT INTO contract_config (name, payout) VALUES ($1, $2)', [config.name, config.payout]);
        }
        
        await client.query('COMMIT'); // Zatwierdź transakcję
        await createLog(req.user.nickname, `zaktualizował konfigurację ról i kontraktów.`);
        res.status(200).json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK'); // Wycofaj zmiany w razie błędu
        res.status(500).json({ success: false, message: err.message });
    } finally {
        client.release();
    }
});

app.put('/api/notifications/read', authenticateToken, async (req, res) => {
    try {
        await db.query('UPDATE notifications SET is_read = true WHERE user_id = $1', [req.user.id]);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Serwowanie frontendu
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
 // await initializeDatabase(); // Zakomentuj tę linię po pierwszym pomyślnym uruchomieniu!
});
