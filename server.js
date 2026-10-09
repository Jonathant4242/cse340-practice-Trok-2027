// Imports
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

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

// Make the environment available to every EJS template.
app.use((req, res, next) => {
    res.locals.NODE_ENV = NODE_ENV;
    next();
});

// Routes

// Render each page using its EJS template
app.get('/', (req, res) => {
    res.render('home', { title: 'Welcome Home' });
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'About Me' });
});

app.get('/products', (req, res) => {
    res.render('products', { title: 'Our Products' });
});

app.get('/student', (req, res) => {
    const student = {
        name: 'John Doe Smith JR',
        id: '123456789',
        email: 'John.Doe.Smith.JR@byui.edu',
        address: '123 College Way, Provo, UT 84604'
    };
    res.render('student', { title: 'Student Information', student });
});


// Test route for 500 errors
app.get('/test-error', (req, res, next) => {
    const err = new Error('This is a test error');
    err.status = 500;
    next(err);
});

// Catch-all route for 404 errors
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// Global error handler
app.use((err, req, res, next) => {
    // Prevent infinite loops, if a response has already been sent, do nothing
    if (res.headersSent || res.finished) {
        return next(err);
    }
    
    // Determine status and template
    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';

    // Prepare data for the template
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: NODE_ENV === 'production' ? 'An error occurred' : err.message,
        stack: NODE_ENV === 'production' ? null : err.stack,
        NODE_ENV
    };

    // Render the appropriate error template with fallback
    try {
        res.status(status).render(`errors/${template}`, context);
    } catch (renderErr) {
        // If rendering fails, send a simple error page instead
        if (!res.headersSent) {
            res.status(status).send(
                `<h1>Error ${status}</h1><p>An error occurred.</p>`
            );
        }
    }
});



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