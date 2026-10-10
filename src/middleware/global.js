export const addLocalVariables = (req, res, next) => {
    const now = new Date();
    const hour = now.getHours();
    const themes = ['blue-theme', 'green-theme', 'red-theme'];
    res.locals.NODE_ENV = req.app.get('env');
    res.locals.currentYear = now.getFullYear();
    res.locals.greeting = hour < 12 ? 'Good morning!' : hour < 18 ? 'Good afternoon!' : 'Good evening!';
    res.locals.bodyClass = themes[Math.floor(Math.random() * themes.length)];
    res.locals.queryParams = req.query;
    next();
};

export const logRequest = (req, res, next) => {
    if (!req.path.startsWith('/.')) console.log(`${req.method} ${req.url}`);
    next();
};

export const addDemoHeaders = (req, res, next) => {
    res.setHeader('X-Demo-Page', 'true');
    res.setHeader('X-Middleware-Demo', 'Hello from middleware!');
    next();
};

export const notFound = (req, res, next) => {
    const error = new Error('Page Not Found');
    error.status = 404;
    next(error);
};

export const errorHandler = (err, req, res, next) => {
    console.error(`${req.method} ${req.originalUrl}:`, err.stack || err.message);
    if (res.headersSent) return next(err);
    const status = Number.isInteger(err.status) && err.status >= 400 && err.status <= 599 ? err.status : 500;
    const environment = req.app.get('env');
    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: environment === 'development' ? err.message : 'An error occurred',
        stack: environment === 'development' ? err.stack : null,
        NODE_ENV: environment
    };
    const template = status === 404 ? '404' : '500';
    res.status(status).render(`errors/${template}`, context, (renderError, html) => {
        if (renderError) {
            console.error('Error template failed:', renderError.message);
            if (res.headersSent) return next(renderError);
            return res.status(status).send(`<h1>Error ${status}</h1><p>An error occurred.</p>`);
        }
        res.send(html);
    });
};
