const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const questionRoutes = require('./routes/questionRoutes');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: false }
}));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/api', authRoutes);
app.use('/api', evaluationRoutes);
app.use('/api', questionRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'static', 'login.html'));
});

app.get('/admin', (req, res) => {
    if (req.session && req.session.user_id && req.session.user_type === 'Admin') {
        res.sendFile(path.join(__dirname, 'public', 'static', 'admin.html'));
    } else {
        res.status(403).send('Forbidden');
    }
});

module.exports = app;