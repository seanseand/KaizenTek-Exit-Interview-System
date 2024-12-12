const db = require('../config/db');
const {body, validationResult} = require('express-validator');

exports.addQuestions = [
    // Validation and sanitization
    body('questionDesc').trim().escape().notEmpty().withMessage('Question description is required.'),
    body('questionType').trim().escape().notEmpty().withMessage('Question type is required.'),

    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        if (!req.session.user_id) {
            return res.status(403).json({message: 'You must be logged in to add a question.'});
        }

        const {questionDesc, questionType} = req.body;
        const creator_id = req.session.user_id;

        const query = "INSERT INTO QUESTION (QuestionDesc, QuestionType, CreatorID) VALUES (?, ?, ?)";
        db.execute(query, [questionDesc, questionType, creator_id], (err, result) => {
            if (err) {
                console.error('Error adding question:', err);
                return res.status(500).json({message: 'Error adding question.', error: err.message});
            }
            res.status(200).json({message: 'Question added successfully!'});
        });
    }
];

exports.editQuestions = [
    // Validation and sanitization
    body('questionID').trim().escape().notEmpty().withMessage('Question ID is required.'),
    body('questionDesc').trim().escape().notEmpty().withMessage('Question description is required.'),
    body('questionType').trim().escape().notEmpty().withMessage('Question type is required.'),

    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        if (!req.session.user_id || req.session.user_type !== 'Admin') {
            return res.status(403).json({message: 'Access denied.'});
        }

        const {questionID, questionDesc, questionType} = req.body;
        const creatorID = req.session.user_id;

        const checkQuery = "SELECT * FROM QUESTION WHERE QuestionID = ? AND CreatorID = ?";
        db.execute(checkQuery, [questionID, creatorID], (err, results) => {
            if (err) {
                console.error('Error checking question ownership:', err);
                return res.status(500).json({message: 'Error checking question ownership.'});
            }

            if (results.length > 0) {
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
    }
];

exports.removeQuestions = (req, res) => {
    // check if the user is logged in
    if (!req.session.user_id) {
        return res.status(403).json({message: 'You must be logged in to remove a question.'});
    }

    const {questionID} = req.query;

    if (!questionID) {
        return res.status(400).json({message: 'Question ID is required.'});
    }

    // delete the question
    const deleteQuery = "DELETE FROM QUESTION WHERE QuestionID = ?";
    db.execute(deleteQuery, [questionID], (err, result) => {
        if (err) {
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({message: 'This question cannot be deleted because it is already answered.'});
            }
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
    // Verify if the user is an admin
    if (!req.session.user_id || req.session.user_type !== 'Admin') {
        return res.status(403).json({message: 'Access denied.'});
    }

    // Set sorting order based on the request query
    const sortOption = req.query.sortOption || 'CreatorID';
    const validSortOptions = ['CreatorID', 'QuestionType', 'QuestionID'];
    const orderBy = validSortOptions.includes(sortOption) ? sortOption : 'CreatorID';

    // Fetch questions sorted by the chosen option
    const query = `
        SELECT q.QuestionID,
               q.QuestionDesc,
               q.QuestionType,
               q.CreatorID,
               u.UserID,
               u.FirstName,
               u.LastName
        FROM QUESTION q
                 LEFT JOIN USER u ON q.CreatorID = u.UserID
        ORDER BY ${orderBy}`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching questions:', err);
            return res.status(500).json({message: 'Error fetching questions.', error: err.message});
        }

        if (results.length > 0) {
            // Format results into a structured response
            const tableRows = results.map(row => ({
                QuestionID: row.QuestionID,
                QuestionDesc: row.QuestionDesc,
                QuestionType: row.QuestionType,
                CreatorID: row.CreatorID,
                CreatorFirstName: row.FirstName,
                CreatorLastName: row.LastName
            }));
            res.status(200).json({questions: tableRows});
        } else {
            res.status(200).json({message: 'No questions found.'});
        }
    });
};

exports.getAssociatedQuestions = (req, res) => {
    // Verify if the user is an admin
    if (!req.session.user_id || req.session.user_type !== 'Admin') {
        return res.status(403).json({ message: 'Access denied.' });
    }

    const evaluationID = req.query.evaluationID;

    if (!evaluationID) {
        return res.status(400).json({ message: 'Evaluation ID is required.' });
    }

    const query = `
        SELECT q.QuestionID, q.QuestionDesc, q.QuestionType
        FROM link l
        JOIN question q ON l.QuestionID = q.QuestionID
        WHERE l.EvaluationID = ?;
    `;

    // console.log('Executing query:', query);
    // console.log('With evaluationID:', evaluationID);

    db.execute(query, [evaluationID], (err, results) => {
        if (err) {
            console.error('Error fetching associated questions:', err);
            return res.status(500).json({ message: 'Error fetching associated questions.', error: err.message });
        }

        // console.log('Query results:', results);
        res.status(200).json({ questions: results });
    });
};

exports.getQuestion = (req, res) => {
    // Verify if the user is an admin
    if (!req.session.user_id || req.session.user_type !== 'Admin') {
        return res.status(403).json({message: 'Access denied.'});
    }

    // Get the question ID from the query string
    const questionID = req.query.questionID;

    if (!questionID) {
        return res.status(400).json({message: 'Question ID is required.'});
    }

    // Prepare the SQL query to fetch the question by ID
    const query = `
        SELECT q.QuestionID,
               q.QuestionDesc,
               q.QuestionType,
               q.CreatorID,
               u.FirstName AS CreatorFirstName,
               u.LastName  AS CreatorLastName
        FROM QUESTION q
                 LEFT JOIN USER u ON q.CreatorID = u.UserID
        WHERE q.QuestionID = ?`;

    db.execute(query, [questionID], (err, results) => {
        if (err) {
            console.error('Error fetching question:', err);
            return res.status(500).json({message: 'Error fetching question.', error: err.message});
        }

        if (results.length > 0) {
            // Return the question details
            res.status(200).json(results[0]);
        } else {
            res.status(404).json({message: 'Question not found.'});
        }
    });
};

