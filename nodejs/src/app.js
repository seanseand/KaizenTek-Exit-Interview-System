require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const questionRoutes = require('./routes/questionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const utilRoutes = require('./routes/utilRoutes');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false, httpOnly: false}
}));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/api', authRoutes);
app.use('/api', evaluationRoutes);
app.use('/api', questionRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', utilRoutes)
app.use('/js', express.static(path.join(__dirname, '..', 'node_modules')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'static', 'login.html'));
});

app.get('/admin', (req, res) => {
    if (req.session && req.session.user_id && req.session.user_type === 'Admin') {
        res.sendFile(path.join(__dirname, 'public', 'static', 'admin_landing.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/admin_respondents', (req, res) => {
    if (req.session && req.session.user_id && req.session.user_type === 'Admin') {
        res.sendFile(path.join(__dirname, 'public', 'static', 'admin_respondents.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/admin_questions', (req, res) => {
    if (req.session && req.session.user_id && req.session.user_type === 'Admin') {
        res.sendFile(path.join(__dirname, 'public', 'static', 'admin_questions.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/admin_evaluations', (req, res) => {
    if (req.session && req.session.user_id && req.session.user_type === 'Admin') {
        res.sendFile(path.join(__dirname, 'public', 'static', 'admin_evaluations.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/admin_utilities', (req, res) => {
    if (req.session && req.session.user_id && req.session.user_type === 'Admin') {
        res.sendFile(path.join(__dirname, 'public', 'static', 'admin_utils.html'));
    } else {
        res.redirect('/');
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;