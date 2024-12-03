const db = require('../config/db');

exports.login = async ({ username, password }) => {
    if (!username || !password) {
        throw new Error('Username and password are required.');
    }

    const query = 'SELECT * FROM USER WHERE Username = ? AND Password = ?';
    const [result] = await db.promise().execute(query, [username, password]);

    if (result.length > 0) {
        const user = result[0];
        return {
            success: true,
            redirect: user.UserType === 'Admin' ? '/admin' : 'student_side/student_home.html',
            user
        };
    } else {
        throw new Error('Invalid login credentials.');
    }
};