const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

router.get('/get_question', questionController.getQuestion);
router.post('/addQuestions', questionController.addQuestions);
router.post('/editQuestions', questionController.editQuestions);
router.post('/removeQuestions', questionController.removeQuestions);
router.get('/view_questions', questionController.viewQuestions);

module.exports = router;