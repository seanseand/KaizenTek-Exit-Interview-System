const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// middleware to parse JSON request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
}));

// connection to the database
const db = mysql.createConnection({
    host: 'localhost',        
    user: 'root',            
    password: '', 
    database: 'kaizentekmid' 
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});

// redirect to index.html
app.use(express.static(path.join(__dirname, '../')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// api for logging in
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // ensure the username and password are provided
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required.'
        });
    }

    // query to verify the user credentials
    const query = 'SELECT * FROM USER WHERE Username = ? AND Password = ?';
    db.execute(query, [username, password], (err, result) => {
        if (err) {
            console.error('Database query error: ', err);
            return res.status(500).json({
                success: false,
                message: 'Internal server error.'
            });
        }

        if (result.length > 0) {
            const user = result[0];

            // store user data in session
            req.session.user_id = user.UserID;
            req.session.user_type = user.UserType;
            req.session.username = user.Username;

            // check if the user is a student and retrieve their ProgramID
            if (user.UserType === 'Student') {
                const programQuery = 'SELECT ProgramID FROM STUDENT WHERE StudentID = ?';
                db.execute(programQuery, [user.UserID], (err, programResult) => {
                    if (err || programResult.length === 0) {
                        return res.status(400).json({
                            success: false,
                            message: 'Error: ProgramID not found for this student.'
                        });
                    }

                    req.session.program_id = programResult[0].ProgramID;
                    return res.json({
                        success: true,
                        redirect: 'student_side/student_home.html'
                    });
                });
            } else if (user.UserType === 'Admin') {
                return res.json({
                    success: true,
                    redirect: 'admin_side/admin.html'
                });
            }
        } else {
            return res.status(401).json({
                success: false,
                message: 'Invalid login credentials. Please try again.'
            });
        }
    });
});

// api for logging out
app.get('/api/logout', (req, res) => {
    // destroy the session (equivalent to session_unset() and session_destroy())
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to destroy session.'
            });
        }
        // redirect to the homepage after session destruction
        res.redirect('/index.html');
    });
});

// api for adding questions
app.post('/api/add_questions', (req, res) => {
    // check if the user is logged in (using session)
    if (!req.session.user_id) {
        return res.status(403).json({ message: 'You must be logged in to add a question.' });
    }

    // check if required fields are present
    const { questionDesc, questionType } = req.body;
    if (!questionDesc || !questionType) {
        return res.status(400).json({ message: 'Required fields are missing.' });
    }

    const creator_id = req.session.user_id; // get the user ID from session

    // prepare the SQL query
    const query = "INSERT INTO QUESTION (QuestionDesc, QuestionType, CreatorID) VALUES (?, ?, ?)";
    
    // execute the query
    db.execute(query, [questionDesc, questionType, creator_id], (err, result) => {
        if (err) {
            console.error('Error adding question:', err);
            return res.status(500).json({ message: 'Error adding question.', error: err.message });
        }
        res.status(200).json({ message: 'Question added successfully!' });
    });
});

// api for adding/removing questions from questionnaires
app.post('/api/add_or_remove_questions', (req, res) => {
    // check if the user is logged in (using session)
    if (!req.session.user_id) {
        return res.status(403).json({ message: 'You must be logged in to modify evaluation questions.' });
    }

    // get the required fields from the request body
    const { evaluationID, action, questionIDs } = req.body;

    if (!evaluationID || !action || !questionIDs) {
        return res.status(400).json({ message: 'Required fields are missing.' });
    }

    // ensure that questionIDs is a comma-separated list and convert it to an array
    const questionIDArray = questionIDs.split(',').map(id => id.trim()).filter(id => id);

    // check if evaluation is in Draft status
    const checkStatusQuery = "SELECT Status FROM EVALUATION WHERE EvaluationID = ?";
    db.execute(checkStatusQuery, [evaluationID], (err, results) => {
        if (err) {
            console.error('Error checking evaluation status:', err);
            return res.status(500).json({ message: 'Error checking evaluation status.', error: err.message });
        }

        const evaluation = results[0];
        if (!evaluation || evaluation.Status !== 'Draft') {
            return res.status(400).json({ message: 'Evaluation not found or is not in Draft status.' });
        }

        if (action === 'add') {
            // add questions to the draft evaluation
            const linkQuery = "INSERT INTO LINK (EvaluationID, QuestionID) VALUES (?, ?)";
            questionIDArray.forEach(questionID => {
                const queryParams = [evaluationID, questionID];
                db.execute(linkQuery, queryParams, (err, result) => {
                    if (err) {
                        console.error('Error adding question to evaluation:', err);
                    }
                });
            });
            res.status(200).json({ message: 'Questions added to the evaluation successfully!' });
        } else if (action === 'remove') {
            // remove questions from the draft evaluation
            const unlinkQuery = "DELETE FROM LINK WHERE EvaluationID = ? AND QuestionID = ?";
            questionIDArray.forEach(questionID => {
                const queryParams = [evaluationID, questionID];
                db.execute(unlinkQuery, queryParams, (err, result) => {
                    if (err) {
                        console.error('Error removing question from evaluation:', err);
                    }
                });
            });
            res.status(200).json({ message: 'Questions removed from the evaluation successfully!' });
        } else {
            res.status(400).json({ message: 'Invalid action specified.' });
        }
    });
});

// api for checking responses
app.get('/api/check_responses', (req, res) => {
    // check if the user is logged in and if they are an admin
    if (!req.session.user_id || req.session.user_type !== 'Admin') {
        return res.status(403).json({ error: 'Access denied.' });
    }

    // get the evaluation ID from the query string
    const evaluationID = req.query.evaluationID;

    if (!evaluationID) {
        return res.status(400).json({ error: 'Evaluation ID is required.' });
    }

    // prepare the SQL query to get distinct StudentID values for the given evaluation
    const query = "SELECT DISTINCT StudentID FROM RESPONSE WHERE EvaluationID = ?";
    db.execute(query, [evaluationID], (err, results) => {
        if (err) {
            console.error('Database query failed:', err);
            return res.status(500).json({ error: 'Error querying the database.' });
        }

        // check if there are responses for the given evaluation
        if (results.length > 0) {
            const studentIDs = results.map(row => row.StudentID);
            res.status(200).json({ status: 'success', students: studentIDs });
        } else {
            res.status(200).json({ status: 'no_responses', message: 'No responses yet for this evaluation.' });
        }
    });
});

// api for editing evaluations
app.post('/api/edit_evaluations', (req, res) => {
    // check if the user is an admin
    if (!req.session.user_id || req.session.user_type !== 'Admin') {
        return res.status(403).json({ message: 'Access denied.' });
    }

    // extract required fields from the request body
    const { evaluationID, evaluationName, programID, startDate, endDate } = req.body;

    if (!evaluationID || !evaluationName || !programID || !startDate || !endDate) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // check if the evaluation status is 'Draft'
    const checkStatusQuery = "SELECT Status FROM EVALUATION WHERE EvaluationID = ?";
    db.execute(checkStatusQuery, [evaluationID], (err, results) => {
        if (err) {
            console.error('Error checking evaluation status:', err);
            return res.status(500).json({ message: 'Error checking evaluation status.' });
        }

        const evaluation = results[0];
        if (!evaluation || evaluation.Status !== 'Draft') {
            return res.status(400).json({ message: "Only evaluations with a status of 'Draft' can be edited." });
        }

        // proceed with updating the evaluation
        const updateQuery = "UPDATE EVALUATION SET EvaluationName = ?, ProgramID = ?, StartDate = ?, EndDate = ? WHERE EvaluationID = ?";
        db.execute(updateQuery, [evaluationName, programID, startDate, endDate, evaluationID], (err, result) => {
            if (err) {
                console.error('Error updating evaluation:', err);
                return res.status(500).json({ message: 'Error updating evaluation.', error: err.message });
            }

            res.status(200).json({ message: 'Evaluation updated successfully.' });
        });
    });
});

// api for editting questions
app.post('/api/edit_questions', (req, res) => {
    // vheck if the user is logged in and is an admin
    if (!req.session.user_id || req.session.user_type !== 'Admin') {
        return res.status(403).json({ message: 'Access denied.' });
    }

    // rxtract required fields from the request body
    const { questionID, questionDesc, questionType } = req.body;

    if (!questionID || !questionDesc || !questionType) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const creatorID = req.session.user_id; // ID of the logged-in admin

    // check if the logged-in admin created this question
    const checkQuery = "SELECT * FROM QUESTION WHERE QuestionID = ? AND CreatorID = ?";
    db.execute(checkQuery, [questionID, creatorID], (err, results) => {
        if (err) {
            console.error('Error checking question ownership:', err);
            return res.status(500).json({ message: 'Error checking question ownership.' });
        }

        if (results.length > 0) {
            // proceed with updating the question
            const updateQuery = "UPDATE QUESTION SET QuestionDesc = ?, QuestionType = ? WHERE QuestionID = ?";
            db.execute(updateQuery, [questionDesc, questionType, questionID], (err, result) => {
                if (err) {
                    console.error('Error updating question:', err);
                    return res.status(500).json({ message: 'Error updating question.', error: err.message });
                }

                res.status(200).json({ message: 'Question updated successfully.' });
            });
        } else {
            res.status(403).json({ message: 'You can only edit questions you created.' });
        }
    });
});

// api for getting username
app.get('/api/get_username', (req, res) => {
    // check if the user is logged in
    if (!req.session.user_id) {
        return res.status(403).json({ error: 'User not logged in.' });
    }

    // check if the username is stored in the session
    if (!req.session.username) {
        return res.status(404).json({ error: 'Username not found in session.' });
    }

    // return the username as JSON
    res.status(200).json({ username: req.session.username });
});

// api for publishing evaluations
app.post('/api/publish_evaluations', (req, res) => {
    // check if the user is logged in and is an admin
    if (!req.session.user_id || req.session.user_type !== 'Admin') {
        return res.status(403).json({ message: 'Access denied.' });
    }

    const { evaluationID } = req.body;

    if (!evaluationID) {
        return res.status(400).json({ message: 'Evaluation ID is required.' });
    }

    // check if the evaluation is in Draft status
    const checkStatusQuery = "SELECT Status FROM EVALUATION WHERE EvaluationID = ?";
    db.execute(checkStatusQuery, [evaluationID], (err, results) => {
        if (err) {
            console.error('Error checking evaluation status:', err);
            return res.status(500).json({ message: 'Error checking evaluation status.', error: err.message });
        }

        const evaluation = results[0];
        if (!evaluation || evaluation.Status !== 'Draft') {
            return res.status(400).json({ message: 'Only evaluations in "Draft" status can be published.' });
        }

        // update the status to Published
        const publishQuery = "UPDATE EVALUATION SET Status = 'Published' WHERE EvaluationID = ?";
        db.execute(publishQuery, [evaluationID], (err, result) => {
            if (err) {
                console.error('Error publishing evaluation:', err);
                return res.status(500).json({ message: 'Error publishing evaluation.', error: err.message });
            }
            res.status(200).json({ message: 'Evaluation published successfully!' });
        });
    });
});

// api for removing questions
app.post('/api/remove_questions', (req, res) => {
    // check if the user is logged in
    if (!req.session.user_id) {
        return res.status(403).json({ message: 'You must be logged in to remove a question.' });
    }

    const { questionID } = req.body;

    if (!questionID) {
        return res.status(400).json({ message: 'Question ID is required.' });
    }

    // delete the question
    const deleteQuery = "DELETE FROM QUESTION WHERE QuestionID = ?";
    db.execute(deleteQuery, [questionID], (err, result) => {
        if (err) {
            console.error('Error removing question:', err);
            return res.status(500).json({ message: 'Error removing question.', error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Question not found.' });
        }

        res.status(200).json({ message: 'Question successfully removed.' });
    });
});

// api for setting evaluations
app.post('/api/set_evaluations', async (req, res) => {
    if (!req.session.user_id) {
        return res.status(403).json({ message: 'You must be logged in to set an evaluation.' });
    }

    const { evaluationName, programID, semester, startDate, endDate, questionIDs } = req.body;

    // validate required fields
    if (!evaluationName || !programID || !semester || !startDate || !endDate || !questionIDs) {
        return res.status(400).json({ message: 'Required fields are missing.' });
    }

    try {
        // begin a transaction
        await db.promise().beginTransaction();

        // insert the evaluation
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

        // link questions to the evaluation
        const linkQuery = "INSERT INTO LINK (EvaluationID, QuestionID) VALUES (?, ?)";
        const questionIDArray = questionIDs.split(',').map(qid => qid.trim());

        for (const questionID of questionIDArray) {
            if (questionID) {
                await db.promise().execute(linkQuery, [evaluationID, questionID]);
            }
        }

        // commit transaction
        await db.promise().commit();

        res.status(200).json({ message: 'Evaluation set successfully with selected questions!' });
    } catch (error) {
        // rollback transaction in case of error
        await db.promise().rollback();
        console.error('Error setting evaluation:', error);
        res.status(500).json({ message: 'Error setting evaluation.', error: error.message });
    }
});

// api for viewing evaluations
app.get('/api/view_evaluations', (req, res) => {
    // Verify if the user is an admin
    if (!req.session.user_id || req.session.user_type !== 'Admin') {
        return res.status(403).json({ message: 'Access denied.' });
    }

    // set sorting order for evaluations
    const sortOption = req.query.sortOption || 'EvaluationID';
    const validSortOptions = ['EvaluationID', 'ProgramID', 'StartDate', 'EndDate'];
    const orderBy = validSortOptions.includes(sortOption) ? sortOption : 'EvaluationID';

    // fetch evaluations sorted by the chosen option
    const query = `SELECT * FROM EVALUATION ORDER BY ${orderBy}`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching evaluations:', err);
            return res.status(500).json({ message: 'Error fetching evaluations.', error: err.message });
        }

        if (results.length > 0) {
            const tableRows = results.map(row => ({
                EvaluationID: row.EvaluationID,
                EvaluationName: row.EvaluationName,
                ProgramID: row.ProgramID,
                Semester: row.Semester,
                StartDate: row.StartDate,
                EndDate: row.EndDate,
                Status: row.Status
            }));
            res.status(200).json({ evaluations: tableRows });
        } else {
            res.status(200).json({ message: 'No evaluations found.' });
        }
    });
});

// api for viewing questions
app.get('/api/view_questions', (req, res) => {
    // verify if the user is an admin
    if (!req.session.user_id || req.session.user_type !== 'Admin') {
        return res.status(403).json({ message: 'Access denied.' });
    }

    // set sorting order
    const sortOption = req.query.sortOption || 'CreatorID';
    const validSortOptions = ['CreatorID', 'QuestionType', 'QuestionID'];
    const orderBy = validSortOptions.includes(sortOption) ? sortOption : 'CreatorID';

    // fetch questions sorted by the chosen option
    const query = `SELECT * FROM QUESTION ORDER BY ${orderBy}`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching questions:', err);
            return res.status(500).json({ message: 'Error fetching questions.', error: err.message });
        }

        if (results.length > 0) {
            const questions = results.map(row => ({
                QuestionID: row.QuestionID,
                Description: row.QuestionDesc,
                Type: row.QuestionType,
                CreatorID: row.CreatorID
            }));
            res.status(200).json({ questions });
        } else {
            res.status(200).json({ message: 'No questions found.' });
        }
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});