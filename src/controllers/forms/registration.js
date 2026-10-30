import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { emailExists, saveUser, getAllUsers } from '../../models/forms/registration.js';

const router = Router();

/**
 * Validation rules for user registration
 */
const registrationValidation = [
    body('name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address'),
    body('emailConfirm')
        .trim()
        .custom((value, { req }) => value === req.body.email)
        .withMessage('Email addresses must match'),
    body('password')
        .isLength({ min: 8 })
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*]/)
        .withMessage('Password must contain at least one special character'),
    body('passwordConfirm')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords must match')
];

/**
 * Display the registration form page.
 */
// Show the registration form page
const showRegistrationForm = (req, res) => {
    res.render('forms/registration/form', {
        title: 'User Registration'
    });
};

/**
 * Handle user registration with validation and password hashing.
 */

const processRegistration = async (req, res) => {
    // Collect errors recorded by the validation middleware.
    const errors = validationResult(req);

    // Log only error messages so submitted passwords stay out of the console.
    if (!errors.isEmpty()) {
        console.error(
            'Validation errors:',
            errors.array().map(error => error.msg)
        );
        return res.redirect('/register');
    }

    // Extract validated fields from the submitted form.
    const { name, email, password } = req.body;

    // Log name and email only, never the password.
    console.log('Processing registration for:', { name, email });

    try {
        // Check if email already exists in database
        const emailAlreadyRegistered = await emailExists(email);

        if (emailAlreadyRegistered) {
            console.error('Email already registered');
            return res.redirect('/register');
        }

        // Hash the password before saving to database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to database with hashed password
       await saveUser(name, email, hashedPassword);

        console.log('User registered successfully');
        res.redirect('/register/list');
    } catch (error) {
 console.error('Error registering user:', error.message);
        res.redirect('/register');
    }
};

/**
 * Display all registered users.
 */
const showAllUsers = async (req, res) => {
    // Initialize users as empty array
    let users = [];

    // Fetch all users from the database
    try {
        users = await getAllUsers();
    } catch (error) {
        console.error('Error fetching users:', error);
    }

// Render the users list with its page title and database results.
res.render('forms/registration/list', {
    title: 'Registered Users',
    users: users
});
};

/**
 * GET /register - Display the registration form
 */
router.get('/', showRegistrationForm);
/**
 * POST /register - Handle registration form submission with validation
 */
router.post('/', registrationValidation, processRegistration);
/**
 * GET /register/list - Display all registered users
 */
router.get('/list', showAllUsers);
export default router;