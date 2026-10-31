import { setupDatabase, testConnection } from './src/models/setup.js';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import routes from './src/controllers/routes.js';
import { addLocalVariables, logRequest, notFound, errorHandler } from './src/middleware/global.js';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { startSessionCleanup } from './src/utils/session-cleanup.js';

// Configuration and file paths
const NODE_ENV = (process.env.NODE_ENV || 'production').toLowerCase();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pgSession = connectPgSimple(session);

// Create the server
const app = express();

// Middleware and session setup will follow here

// Set the environment for the app
app.set('env', NODE_ENV);

// Session setup
app.use(session({
    store: new pgSession({
        conObject: {
            connectionString: process.env.DB_URL
        },
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: NODE_ENV.includes('dev') !== true,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Use EJS and find templates in src/views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Make files inside public accessible to browsers
app.use(express.static(path.join(__dirname, 'public')));

// Allow Express to receive and process POST data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Shared request setup, then routes, then error handling.
app.use(addLocalVariables);
app.use(logRequest);
app.use(routes);
app.use(notFound);
app.use(errorHandler);


// Start automatic session cleanup
startSessionCleanup();


// Nodemon restarts close these connections, prompting browsers to reload.
let wsServer;

if (NODE_ENV.includes('dev')) {
    try {
        const { WebSocketServer } = await import('ws');
        const wsPort = Number(PORT) + 1;
        wsServer = new WebSocketServer({ port: wsPort });

        wsServer.on('listening', () => {
            console.log(`WebSocket server is running on port ${wsPort}`);
        });
        wsServer.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}

// Start the server
app.listen(PORT, async () => {
    await setupDatabase();
    await testConnection();
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});