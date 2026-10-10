import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import routes from './src/controllers/routes.js';
import { addLocalVariables, logRequest, notFound, errorHandler } from './src/middleware/global.js';

// Configuration and file paths
const NODE_ENV = (process.env.NODE_ENV || 'production').toLowerCase();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the server
const app = express();
app.set('env', NODE_ENV);

// Use EJS and find templates in src/views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Make files inside public accessible to browsers
app.use(express.static(path.join(__dirname, 'public')));

// Shared request setup, then routes, then error handling.
app.use(addLocalVariables);
app.use(logRequest);
app.use(routes);
app.use(notFound);
app.use(errorHandler);

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
app.listen(PORT, (error) => {
    if (error) {
        console.error('Failed to start server:', error);
        process.exitCode = 1;
        if (wsServer) {
            for (const client of wsServer.clients) client.terminate();
            wsServer.close();
        }
        return;
    }

    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});