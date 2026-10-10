import { getStudent } from '../models/student/student.js';

export const homePage = (req, res) => res.render('home', { title: 'Welcome Home' });
export const aboutPage = (req, res) => res.render('about', { title: 'About Me' });
export const demoPage = (req, res) => res.render('demo', { title: 'Middleware Demo' });
export const studentPage = (req, res) =>
    res.render('student', { title: 'Student Information', student: getStudent() });

export const testError = (req, res, next) => {
    const error = new Error('This is a test error');
    error.status = 500;
    next(error);
};
