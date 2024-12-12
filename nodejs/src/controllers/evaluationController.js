const db = require('../config/db');
const {body, validationResult} = require('express-validator');

exports.addOrRemoveQuestions = [
    // Validation and sanitization
    body('evaluationID').trim().escape().notEmpty().withMessage('Evaluation ID is required.'),
    body('action').trim().escape().notEmpty().withMessage('Action is required.'),
    body('questionIDs').trim().escape().notEmpty().withMessage('Question IDs are required.'),

    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        if (!req.session.user_id) {
            return res.status(403).json({message: 'You must be logged in to modify evaluation questions.'});
        }

        const {evaluationID, action, questionIDs} = req.body;
        const questionIDArray = questionIDs.split(',').map(id => id.trim()).filter(id => id);

        const checkStatusQuery = "SELECT Status FROM EVALUATION WHERE EvaluationID = ?";
        db.execute(checkStatusQuery, [evaluationID], (err, results) => {
            if (err) {
                console.error('Error checking evaluation status:', err);
                return res.status(500).json({message: 'Error checking evaluation status.', error: err.message});
            }

            const evaluation = results[0];
            if (!evaluation || evaluation.Status !== 'Draft') {
                return res.status(400).json({message: 'Evaluation not found or is not in Draft status.'});
            }

            if (action === 'add') {
                const linkQuery = "INSERT INTO LINK (EvaluationID, QuestionID) VALUES (?, ?)";
                questionIDArray.forEach(questionID => {
                    const queryParams = [evaluationID, questionID];
                    db.execute(linkQuery, queryParams, (err, result) => {
                        if (err) {
                            console.error('Error adding question to evaluation:', err);
                        }
                    });
                });
                res.status(200).json({message: 'Questions added to the evaluation successfully!'});
            } else if (action === 'remove') {
                const unlinkQuery = "DELETE FROM LINK WHERE EvaluationID = ? AND QuestionID = ?";
                questionIDArray.forEach(questionID => {
                    const queryParams = [evaluationID, questionID];
                    db.execute(unlinkQuery, queryParams, (err, result) => {
                        if (err) {
                            console.error('Error removing question from evaluation:', err);
                        }
                    });
                });
                res.status(200).json({message: 'Questions removed from the evaluation successfully!'});
            } else {
                res.status(400).json({message: 'Invalid action specified.'});
            }
        });
    }
];
exports.checkResponses = (req, res) => {
    // check if the user is logged in and if they are an admin
    if (!req.session.user_id || req.session.user_type !== 'Admin') {
        return res.status(403).json({error: 'Access denied.'});
    }

    // get the evaluation ID from the query string
    const evaluationID = req.query.evaluationID;

    if (!evaluationID) {
        return res.status(400).json({error: 'Evaluation ID is required.'});
    }

    // prepare the SQL query to count distinct StudentID values for the given evaluation
    const query = "SELECT COUNT(DISTINCT StudentID) AS respondentCount FROM RESPONSE WHERE EvaluationID = ?";
    db.execute(query, [evaluationID], (err, results) => {
        if (err) {
            console.error('Database query failed:', err);
            return res.status(500).json({error: 'Error querying the database.'});
        }

        // check if there are responses for the given evaluation
        if (results.length > 0 && results[0].respondentCount > 0) {
            res.status(200).json({
                status: 'success',
                respondentCount: results[0].respondentCount // include the count in the response
            });
        } else {
            res.status(200).json({
                status: 'no_responses',
                message: 'No responses yet for this evaluation.',
                respondentCount: 0 // include the count in the response
            });
        }
    });
};

exports.editEvaluations = [
    // Validation and sanitization
    body('evaluationID').trim().escape().notEmpty().withMessage('Evaluation ID is required.'),
    body('evaluationName').trim().escape().notEmpty().withMessage('Evaluation name is required.'),
    body('programID').trim().escape().notEmpty().withMessage('Program ID is required.'),
    body('startDate').trim().escape().notEmpty().withMessage('Start date is required.'),
    body('endDate').trim().escape().notEmpty().withMessage('End date is required.'),

    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        if (!req.session.user_id || req.session.user_type !== 'Admin') {
            return res.status(403).json({message: 'Access denied.'});
        }

        const {evaluationID, evaluationName, programID, startDate, endDate} = req.body;

        const checkStatusQuery = "SELECT Status FROM EVALUATION WHERE EvaluationID = ?";
        db.execute(checkStatusQuery, [evaluationID], (err, results) => {
            if (err) {
                console.error('Error checking evaluation status:', err);
                return res.status(500).json({message: 'Error checking evaluation status.'});
            }

            const evaluation = results[0];
            if (!evaluation || evaluation.Status !== 'Draft') {
                return res.status(400).json({message: "Only evaluations with a status of 'Draft' can be edited."});
            }

            const updateQuery = "UPDATE EVALUATION SET EvaluationName = ?, ProgramID = ?, StartDate = ?, EndDate = ? WHERE EvaluationID = ?";
            db.execute(updateQuery, [evaluationName, programID, startDate, endDate, evaluationID], (err, result) => {
                if (err) {
                    console.error('Error updating evaluation:', err);
                    return res.status(500).json({message: 'Error updating evaluation.', error: err.message});
                }

                res.status(200).json({message: 'Evaluation updated successfully.'});
            });
        });
    }
];

exports.publishEvaluations = (req, res) => {
    // check if the user is logged in and is an admin
    if (!req.session.user_id || req.session.user_type !== 'Admin') {
        return res.status(403).json({message: 'Access denied.'});
    }

    const {evaluationID} = req.body;

    if (!evaluationID) {
        return res.status(400).json({message: 'Evaluation ID is required.'});
    }

    // check if the evaluation is in Draft status
    const checkStatusQuery = "SELECT Status FROM EVALUATION WHERE EvaluationID = ?";
    db.execute(checkStatusQuery, [evaluationID], (err, results) => {
        if (err) {
            console.error('Error checking evaluation status:', err);
            return res.status(500).json({message: 'Error checking evaluation status.', error: err.message});
        }

        const evaluation = results[0];
        if (!evaluation || evaluation.Status !== 'Draft') {
            return res.status(400).json({message: 'Only evaluations in "Draft" status can be published.'});
        }

        // update the status to Published
        const publishQuery = "UPDATE EVALUATION SET Status = 'Published' WHERE EvaluationID = ?";
        db.execute(publishQuery, [evaluationID], (err, result) => {
            if (err) {
                console.error('Error publishing evaluation:', err);
                return res.status(500).json({message: 'Error publishing evaluation.', error: err.message});
            }
            res.status(200).json({message: 'Evaluation published successfully!'});
        });
    });
};

exports.setEvaluations = async (req, res) => {
    if (!req.session.user_id) {
        return res.status(403).json({message: 'You must be logged in to set an evaluation.'});
    }

    const {evaluationName, programID, semester, startDate, endDate, questionIDs} = req.body;

    // Validate required fields
    if (!evaluationName || !programID || !semester || !startDate || !endDate || !questionIDs) {
        return res.status(400).json({message: 'Required fields are missing.'});
    }

    try {
        // Begin a transaction
        await db.promise().beginTransaction();

        // Insert the evaluation
        const evaluationQuery = `
            INSERT INTO EVALUATION (EvaluationName, ProgramID, Semester, StartDate, EndDate, Status)
            VALUES (?, ?, ?, ?, ?, 'Draft')
        `;
        const [evaluationResult] = await db.promise().execute(evaluationQuery, [
            evaluationName,
            programID,
            semester,
            startDate,
            endDate
        ]);

        const evaluationID = evaluationResult.insertId;

        // Link questions to the evaluation
        const linkQuery = "INSERT INTO LINK (EvaluationID, QuestionID) VALUES ?";
        const linkValues = questionIDs.map(questionID => [evaluationID, questionID]);
        await db.promise().query(linkQuery, [linkValues]);

        // Commit the transaction
        await db.promise().commit();

        res.json({message: 'Evaluation created successfully.'});
    } catch (error) {
        // Rollback the transaction in case of error
        await db.promise().rollback();
        console.error(error);
        res.status(500).json({message: 'Error creating evaluation.'});
    }
};

exports.viewEvaluations = (req, res) => {
    // Verify if the user is an admin
    if (!req.session.user_id || req.session.user_type !== 'Admin') {
        return res.status(403).json({message: 'Access denied.'});
    }

    // Set sorting order for evaluations
    const sortOption = req.query.sortOption || 'EvaluationID';
    const validSortOptions = ['EvaluationID', 'ProgramID', 'StartDate', 'EndDate'];
    const orderBy = validSortOptions.includes(sortOption) ? sortOption : 'EvaluationID';

    // Fetch evaluations along with program names
    const query = `
        SELECT e.EvaluationID,
               e.EvaluationName,
               e.ProgramID,
               e.Semester,
               e.StartDate,
               e.EndDate,
               e.Status,
               p.ProgramName
        FROM EVALUATION e
                 LEFT JOIN PROGRAM p ON e.ProgramID = p.ProgramID
        ORDER BY ${orderBy}
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching evaluations:', err);
            return res.status(500).json({message: 'Error fetching evaluations.', error: err.message});
        }

        if (results.length > 0) {
            const tableRows = results.map(row => ({
                EvaluationID: row.EvaluationID,
                EvaluationName: row.EvaluationName,
                ProgramID: row.ProgramID,
                ProgramName: row.ProgramName,
                Semester: row.Semester,
                StartDate: row.StartDate,
                EndDate: row.EndDate,
                Status: row.Status,
            }));
            res.status(200).json({evaluations: tableRows});
        } else {
            res.status(200).json({message: 'No evaluations found.'});
        }
    });
};
