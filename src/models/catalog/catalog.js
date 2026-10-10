const courses = {
    'CS121': {
        id: 'CS121',
        title: 'Introduction to Programming',
        description: 'Learn programming fundamentals using JavaScript and basic web development concepts.',
        credits: 3,
        sections: [
            { time: '9:00 AM', room: 'STC 392', professor: 'Brother Jack' },
            { time: '2:00 PM', room: 'STC 394', professor: 'Sister Enkey' },
            { time: '11:00 AM', room: 'STC 390', professor: 'Brother Keers' }
        ]
    },
    'MATH110': {
        id: 'MATH110',
        title: 'College Algebra',
        description: 'Fundamental algebraic concepts including functions, graphing, and problem solving.',
        credits: 4,
        sections: [
            { time: '8:00 AM', room: 'MC 301', professor: 'Sister Anderson' },
            { time: '1:00 PM', room: 'MC 305', professor: 'Brother Miller' },
            { time: '3:00 PM', room: 'MC 307', professor: 'Brother Thompson' }
        ]
    },
    'ENG101': {
        id: 'ENG101',
        title: 'Academic Writing',
        description: 'Develop writing skills for academic and professional communication.',
        credits: 3,
        sections: [
            { time: '10:00 AM', room: 'GEB 201', professor: 'Sister Anderson' },
            { time: '12:00 PM', room: 'GEB 205', professor: 'Brother Davis' },
            { time: '4:00 PM', room: 'GEB 203', professor: 'Sister Enkey' }
        ]
    }
};

// Return copies so one request cannot change the shared course data.
export const getAllCourses = () => structuredClone(courses);

export const getCourseById = (courseId) => {
    if (!Object.hasOwn(courses, courseId)) return null;
    return structuredClone(courses[courseId]);
};

export const normalizeSort = (sort) =>
    ['time', 'professor', 'room'].includes(sort) ? sort : 'time';

const minutesSinceMidnight = (time) => {
    const [clock, period] = time.split(' ');
    const [hours, minutes] = clock.split(':').map(Number);
    return (hours % 12 + (period === 'PM' ? 12 : 0)) * 60 + minutes;
};

export const sortSections = (sections, sortBy) => {
    const sorted = structuredClone(sections);
    if (sortBy === 'professor' || sortBy === 'room') {
        return sorted.sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
    }
    return sorted.sort((a, b) => minutesSinceMidnight(a.time) - minutesSinceMidnight(b.time));
};
