// Import getSortedFaculty and getFacultyById from the faculty model.
import {
    getSortedFaculty,
    getFacultyById
} from '../../models/faculty/faculty.js';

// Create facultyListPage with req and res parameters.
const facultyListPage = (req, res) => {
    // List the allowed sorting options: name, department, and title.
    const allowedSorts = ['name', 'department', 'title'];

    // Read the sort option from the request's query parameters.
    let sortBy = req.query.sort;

    // If the option is invalid or missing, default to name.
    if (!allowedSorts.includes(sortBy)) {
        sortBy = 'name';
    }

    // Ask the model for the faculty array sorted by that option.
    const faculty = getSortedFaculty(sortBy);

    // Render faculty/list with:
    // - title: the page title
    // - faculty: the sorted faculty array
    // - currentSort: the validated sorting option
    res.render('faculty/list', {
        title: 'Faculty Directory',
        faculty,
        currentSort: sortBy
    });
};

// Create facultyDetailPage with req, res, and next parameters.
const facultyDetailPage = (req, res, next) => {
    // Read facultyId from the request's route parameters.
    const facultyId = req.params.facultyId;

    // Ask the model for the faculty member with that ID.
    const faculty = getFacultyById(facultyId);

    // If no faculty member is found:
    if (!faculty) {
        // Create an error with a helpful message.
        const error = new Error('Faculty member not found');

        // Set its status to 404.
        error.status = 404;

        // Forward it with next(error) and return to stop this function.
        return next(error);
    }

    // Render faculty/detail with:
    // - title: the faculty member's name
    // - faculty: the faculty member's information
    res.render('faculty/detail', {
        title: faculty.name,
        faculty
    });
};

// Export facultyListPage and facultyDetailPage.
export { facultyListPage, facultyDetailPage };