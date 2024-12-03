const db = require('../config/db');

exports.addQuestions = (req, res) => {
    if (!req.session.user_id) {
        return res.status(403).json({message: 'You must be logged in to add a question.'});
    }

    // check if required fields are present
    const {questionDesc, questionType} = req.body;
    if (!questionDesc || !questionType) {
        return res.status(400).json({message: 'Required fields are missing.'});
    }

    const creator_id = req.session.user_id; // get the user ID from session

    // prepare the SQL query
    const query = "INSERT INTO QUESTION (QuestionDesc, QuestionType, CreatorID) VALUES (?, ?, ?)";

    // execute the query
    db.execute(query, [questionDesc, questionType, creator_id], (err, result) => {
        if (err) {
            console.error('Error adding question:', err);
            return res.status(500).json({message: 'Error adding question.', error: err.message});
        }
        res.status(200).json({message: 'Question added successfully!'});
    });
};

exports.editQuestions = (req, res) => {
    // check if the user is logged in and is an admin
    if (!req.session.user_id || req.session.user_type !== 'Admin') {
        return res.status(403).json({message: 'Access denied.'});
    }

    // extract required fields from the request body
    const {questionID, questionDesc, questionType} = req.body;

    if (!questionID || !questionDesc || !questionType) {
        return res.status(400).json({message: 'All fields are required.'});
    }

    const creatorID = req.session.user_id; // ID of the logged-in admin

    // check if the logged-in admin created this question
    const checkQuery = "SELECT * FROM QUESTION WHERE QuestionID = ? AND CreatorID = ?";
    db.execute(checkQuery, [questionID, creatorID], (err, results) => {
        if (err) {
            console.error('Error checking question ownership:', err);
            return res.status(500).json({message: 'Error checking question ownership.'});
        }

        if (results.length > 0) {
            // proceed with updating the question
            const updateQuery = "UPDATE QUESTION SET QuestionDesc = ?, QuestionType = ? WHERE QuestionID = ?";
            db.execute(updateQuery, [questionDesc, questionType, questionID], (err, result) => {
                if (err) {
                    console.error('Error updating question:', err);
                    return res.status(500).json({message: 'Error updating question.', error: err.message});
                }

                res.status(200).json({message: 'Question updated successfully.'});
            });
        } else {
            res.status(403).json({message: 'You can only edit questions you created.'});
        }
    });
};

exports.removeQuestions = (req, res) => {
    // check if the user is logged in
    if (!req.session.user_id) {
        return res.status(403).json({message: 'You must be logged in to remove a question.'});
    }

    const {questionID} = req.body;

    if (!questionID) {
        return res.status(400).json({message: 'Question ID is required.'});
    }

    // delete the question
    const deleteQuery = "DELETE FROM QUESTION WHERE QuestionID = ?";
    db.execute(deleteQuery, [questionID], (err, result) => {
        if (err) {
            console.error('Error removing question:', err);
            return res.status(500).json({message: 'Error removing question.', error: err.message});
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({message: 'Question not found.'});
        }

        res.status(200).json({message: 'Question successfully removed.'});
    });
};

exports.viewQuestions = (req, res) => {
    // verify if the user is an admin
    if (!req.session.user_id || req.session.user_type !== 'Admin') {
        return res.status(403).json({message: 'Access denied.'});
    }

    // set sorting order
    const sortOption = req.query.sortOption || 'CreatorID';
    const validSortOptions = ['CreatorID', 'QuestionType', 'QuestionID'];
    const orderBy = validSortOptions.includes(sortOption) ? sortOption : 'CreatorID';

    // fetch questions sorted by the chosen option
    const query = `SELECT *
                   FROM QUESTION
                   ORDER BY ${orderBy}`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching questions:', err);
            return res.status(500).json({message: 'Error fetching questions.', error: err.message});
        }

        if (results.length > 0) {
            const questions = results.map(row => ({
                QuestionID: row.QuestionID,
                Description: row.QuestionDesc,
                Type: row.QuestionType,
                CreatorID: row.CreatorID
            }));
            res.status(200).json({questions});
        } else {
            res.status(200).json({message: 'No questions found.'});
        }
    });
};