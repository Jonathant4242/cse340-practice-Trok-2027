import { Router } from 'express';
import { homePage, aboutPage, demoPage, studentPage, testError } from './index.js';
import { catalogPage, courseDetailPage } from './catalog/catalog.js';
import { addDemoHeaders } from '../middleware/global.js';
import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';

const router = Router();
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
router.get('/catalog/:courseId', courseDetailPage);
// Test error route.
router.get('/test-error', testError);
// Display the faculty directory.
router.get('/faculty', facultyListPage);
// Display an individual faculty member.
router.get('/faculty/:facultyId', facultyDetailPage);

export default router;
