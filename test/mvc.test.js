import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { fileURLToPath } from 'node:url';
import routes from '../src/controllers/routes.js';
import { addLocalVariables, notFound, errorHandler } from '../src/middleware/global.js';
import { getAllCourses, getCourseById, normalizeSort, sortSections } from '../src/models/catalog/catalog.js';

const app = express();
app.set('env', 'production');
app.set('view engine', 'ejs');
app.set('views', fileURLToPath(new URL('../src/views', import.meta.url)));
app.use(express.static(fileURLToPath(new URL('../public', import.meta.url))));
app.use(addLocalVariables);
app.use(routes);
app.use(notFound);
app.use(errorHandler);

test('catalog lookups and sorting protect shared data', () => {
    assert.equal(getCourseById('constructor'), null);
    assert.equal(getCourseById('__proto__'), null);
    assert.equal(getCourseById('INVALID'), null);
    const original = getCourseById('CS121');
    const times = sortSections(original.sections, 'time');
    assert.deepEqual(times.map(s => s.time), ['9:00 AM', '11:00 AM', '2:00 PM']);
    assert.equal(original.sections[1].time, '2:00 PM');
    times[0].room = 'Changed';
    assert.equal(getCourseById('CS121').sections[0].room, 'STC 392');
    const all = getAllCourses();
    all.CS121.title = 'Changed';
    assert.equal(getCourseById('CS121').title, 'Introduction to Programming');
    for (const invalid of [undefined, 'invalid', ['room', 'time'], {}]) {
        assert.equal(normalizeSort(invalid), 'time');
    }
    const sample = [{ time: '12:00 PM', room: 'B', professor: 'Z' }, { time: '12:00 AM', room: 'A', professor: 'A' }];
    for (const sort of ['time', 'professor', 'room']) assert.equal(sortSections(sample, sort)[0].room, 'A');
});

test('error handler falls back if rendering fails and delegates after headers', t => {
    t.mock.method(console, 'error', () => {});
    let body;
    let code;
    const req = { method: 'GET', originalUrl: '/test', app };
    const res = {
        headersSent: false,
        status(value) { code = value; return this; },
        render(view, data, callback) { callback(new Error('Missing template')); },
        send(value) { body = value; }
    };
    const error = new Error('Original failure');
    error.status = 200;
    errorHandler(error, req, res, () => assert.fail('Unexpected delegation'));
    assert.equal(code, 500);
    assert.match(body, /Error 500/);
    assert.doesNotMatch(body, /Original failure|Missing template/);
    res.headersSent = true;
    let forwarded;
    errorHandler(error, req, res, err => { forwarded = err; });
    assert.equal(forwarded, error);
});

test('pages, errors, query options, assets, and route-specific headers', async t => {
    const loggedErrors = t.mock.method(console, 'error', () => {});
    const server = await new Promise((resolve, reject) => {
        const instance = app.listen(0, '127.0.0.1', error => error ? reject(error) : resolve(instance));
        instance.on('error', reject);
    });
    t.after(() => new Promise(resolve => server.close(resolve)));
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const path of ['/', '/about', '/student', '/demo', '/catalog', '/catalog/CS121', '/catalog/MATH110', '/catalog/ENG101']) {
        const response = await fetch(base + path);
        assert.equal(response.status, 200, path);
        assert.equal(response.headers.get('X-Demo-Page'), path === '/demo' ? 'true' : null, path);
        const html = await response.text();
        assert.match(html, /<\/html>/);
        assert.doesNotMatch(html, /href="\/products"/);
        assert.doesNotMatch(html, /&lt;p&gt;Good/);
    }
    for (const path of ['/products', '/missing', '/catalog/INVALID', '/catalog/constructor', '/catalog/__proto__']) {
        const response = await fetch(base + path);
        assert.equal(response.status, 404, path);
        assert.match(await response.text(), /404 - Page Not Found/);
    }
    for (const sort of ['time', 'professor', 'room', 'invalid', 'room&sort=time']) {
        const response = await fetch(`${base}/catalog/CS121?sort=${sort}`);
        assert.equal(response.status, 200);
        const html = await response.text();
        const expected = ['professor', 'room'].includes(sort) ? sort : 'time';
        assert.match(html, new RegExp(`sort=${expected}" class="active"`));
    }
    const ordered = await (await fetch(base + '/catalog/CS121')).text();
    assert.ok(ordered.indexOf('9:00 AM') < ordered.indexOf('11:00 AM'));
    assert.ok(ordered.indexOf('11:00 AM') < ordered.indexOf('2:00 PM'));
    const demo = await (await fetch(base + '/demo?debug=%3Cscript%3E')).text();
    assert.match(demo, /&lt;script&gt;/);
    const css = await fetch(base + '/css/main.css');
    assert.equal(css.status, 200);
    assert.equal(css.headers.get('X-Demo-Page'), null);
    let response = await fetch(base + '/test-error');
    assert.equal(response.status, 500);
    assert.doesNotMatch(await response.text(), /This is a test error|Development Error Details/);
    app.set('env', 'development');
    response = await fetch(base + '/test-error');
    assert.equal(response.status, 500);
    assert.match(await response.text(), /This is a test error/);
    app.set('env', 'production');
    assert.ok(loggedErrors.mock.callCount() >= 7, 'Error requests are logged');
});
