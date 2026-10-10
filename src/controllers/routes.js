import { Router } from 'express';
import { homePage, aboutPage, demoPage, studentPage, testError } from './index.js';
import { catalogPage, courseDetailPage } from './catalog/catalog.js';
import { addDemoHeaders } from '../middleware/global.js';

const router = Router();
router.get('/', homePage);
router.get('/about', aboutPage);
router.get('/student', studentPage);
router.get('/demo', addDemoHeaders, demoPage);
router.get('/catalog', catalogPage);
router.get('/catalog/:courseId', courseDetailPage);
router.get('/test-error', testError);

export default router;
