const authService = require('../services/authService');

exports.login = async (req, res) => {
    try {
        const result = await authService.login(req.body);
        if (result.user.UserType !== 'Admin') {
            return res.status(403).json({ message: 'Only admins can log in.' });
        }
        req.session.user_id = result.user.UserID;
        req.session.user_type = result.user.UserType;
        req.session.username = result.user.Username;
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to destroy session.'
            });
        }
        res.redirect('/');
    });
};

exports.getUsername = (req, res) => {
    if (req.session.username) {
        res.json({ username: req.session.username });
    } else {
        res.status(404).json({ error: 'Username not found' });
    }
};