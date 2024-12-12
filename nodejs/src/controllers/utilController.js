const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const db = require('../config/db');

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

exports.uploadFile = (req, res) => {
    if (!req.session.user_id) {
        return res.status(403).json({ message: 'You must be logged in to upload a file.' });
    }

    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const results = [];
    fs.createReadStream(file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            const userQuery = "INSERT INTO USER (Username, LastName, FirstName, Email, Password, UserType) VALUES ?";
            const userValues = results.map(row => [row.Username, row.LastName, row.FirstName, row.Email, row.Password, row.UserType]);

            db.query(userQuery, [userValues], (err, result) => {
                if (err) {
                    console.error('Error inserting user data:', err);
                    return res.status(500).json({ message: 'Error inserting user data.', error: err.message });
                }

                const insertedUserIds = result.insertId;
                const studentValues = results
                    .filter(row => row.UserType === 'Student')
                    .map((row, index) => [insertedUserIds + index, row.ProgramID]);

                const studentQuery = "INSERT INTO STUDENT (StudentID, ProgramID) VALUES ?";
                db.query(studentQuery, [studentValues], (err) => {
                    if (err) {
                        console.error('Error inserting student data:', err);
                        return res.status(500).json({ message: 'Error inserting student data.', error: err.message });
                    }

                    res.status(200).json({ message: 'Data added successfully!' });
                });
            });
        });
};

module.exports.upload = upload.single('file');