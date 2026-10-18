// Update these imports:
import { getAllCourses, getCourseBySlug } from '../../models/catalog/courses.js';
import { getSectionsByCourseSlug } from '../../models/catalog/catalog.js';

// Route handler for the course catalog list page
const catalogPage = async (req, res) => {
    // Wait for the database results before using them.
    const courses = await getAllCourses();

    // Inspect one course to check the template's property names.
    console.log('First course:', courses[0]);

    res.render('catalog', {
        title: 'Course Catalog',
        courses: courses
    });
};

// Route handler for individual course detail pages
const courseDetailPage = async (req, res, next) => {
    const courseSlug = req.params.slugId;
    
    // Model functions are async, so we must await them
    const course = await getCourseBySlug(courseSlug);
    
    // Our model returns empty object {} when not found, not null
    // Check if the object is empty using Object.keys()
  if (Object.keys(course).length === 0) {
    const err = new Error(`Course ${courseSlug} not found`);
    err.status = 404;
    return next(err);
}
    
    // Get sections (course offerings) separately from the catalog
    // Pass the sortBy parameter directly to the model - PostgreSQL handles the sorting
    const sortBy = req.query.sort || 'time';
    const sections = await getSectionsByCourseSlug(courseSlug, sortBy);
    
// Check the course properties used in course-detail.ejs.
console.log('Course:', course);

// Check the offering properties used in the template's sections loop.
console.log('First section:', sections[0]);

    res.render('course-detail', {
        title: `${course.courseCode} - ${course.name}`,
        course: course,
        sections: sections,
        currentSort: sortBy
    });
};

export { catalogPage, courseDetailPage };