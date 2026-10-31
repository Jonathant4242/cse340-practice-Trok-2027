import { Router } from 'express';
import { homePage, aboutPage, demoPage, studentPage, testError } from './index.js';
import { catalogPage, courseDetailPage } from './catalog/catalog.js';
import { addDemoHeaders } from '../middleware/global.js';
import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';
import contactRoutes from './forms/contact.js';
import registrationRoutes from './forms/registration.js';
import loginRoutes from './forms/login.js';
import { processLogout, showDashboard } from './forms/login.js';
import { requireLogin } from '../middleware/auth.js';


const router = Router();
// Load catalog styles for the catalog list and course detail pages.
router.use('/catalog', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/catalog.css">');
    next();
});

// Load faculty styles for the directory and individual profiles.
router.use('/faculty', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/faculty.css">');
    next();
});
    // Add contact-specific styles to all contact routes
router.use('/contact', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/contact.css">');
    next();
});
// Add registration-specific styles to all registration routes
router.use('/register', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/registration.css">');
    next();
});
// Add login-specific styles to all login routes
router.use('/login', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/login.css">');
    next();
});

// Login routes (form and submission)
router.use('/login', loginRoutes);

// Authentication-related routes at root level
router.get('/logout', processLogout);
router.get('/dashboard', requireLogin, showDashboard);

// Home page route.
router.get('/', homePage);
// About page route.
router.get('/about', aboutPage);
// Student page route.
router.get('/student', studentPage);
// Demo page route.
router.get('/demo', addDemoHeaders, demoPage);
// Display the course catalog.
router.get('/catalog', catalogPage);
// Display the details for a specific course.
router.get('/catalog/:slugId', courseDetailPage);
// Test error route.
router.get('/test-error', testError);
// Display the faculty directory.
router.get('/faculty', facultyListPage);
// Display an individual faculty member.
router.get('/faculty/:facultySlug', facultyDetailPage);
// Contact form routes.
router.use('/contact', contactRoutes);
// Registration routes
router.use('/register', registrationRoutes);



export default router;
