import { getAllCourses, getCourseById, normalizeSort, sortSections } from '../../models/catalog/catalog.js';

export const catalogPage = (req, res) => {
    res.render('catalog', { title: 'Course Catalog', courses: getAllCourses() });
};

export const courseDetailPage = (req, res, next) => {
    const course = getCourseById(req.params.courseId);
    if (!course) {
        const error = new Error('Course not found');
        error.status = 404;
        return next(error);
    }
    const currentSort = normalizeSort(req.query.sort);
    course.sections = sortSections(course.sections, currentSort);
    res.render('course-detail', {
        title: `${course.id} - ${course.title}`,
        course,
        currentSort
    });
};
