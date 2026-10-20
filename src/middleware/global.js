// Create fresh asset lists for each request.
const setHeadAssetsFunctionality = (res) => {
    res.locals.styles = [];
    res.locals.scripts = [];

    // Allow controllers to register CSS and JavaScript tags.
    res.addStyle = (css, priority = 0) => {
        res.locals.styles.push({ content: css, priority });
    };

    res.addScript = (js, priority = 0) => {
        res.locals.scripts.push({ content: js, priority });
    };

    // Give templates the tags in priority order: higher numbers first.
    res.locals.renderStyles = () => {
        return res.locals.styles
            .sort((a, b) => b.priority - a.priority)
            .map(item => item.content)
            .join('\n');
    };

    res.locals.renderScripts = () => {
        return res.locals.scripts
            .sort((a, b) => b.priority - a.priority)
            .map(item => item.content)
            .join('\n');
    };
};

// Middleware to add local variables to the response object.
export const addLocalVariables = (req, res, next) => {
    const now = new Date();
    const hour = now.getHours();
    const themes = ['blue-theme', 'green-theme', 'red-theme'];

    res.locals.NODE_ENV = req.app.get('env');
    res.locals.currentYear = now.getFullYear();
    res.locals.greeting = hour < 12 ? 'Good morning!' : hour < 18 ? 'Good afternoon!' : 'Good evening!';
    res.locals.bodyClass = themes[Math.floor(Math.random() * themes.length)];
    res.locals.queryParams = req.query;

    // Make asset helpers available before the request reaches a controller.
    setHeadAssetsFunctionality(res);

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
