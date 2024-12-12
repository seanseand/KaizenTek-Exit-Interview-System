const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');

router.post('/add_or_remove_questions', evaluationController.addOrRemoveQuestions);
router.get('/check_responses', evaluationController.checkResponses);
router.post('/editEvaluations', evaluationController.editEvaluations);
router.post('/publish_evaluations', evaluationController.publishEvaluations);
router.post('/setEvaluations', evaluationController.setEvaluations);
router.get('/view_evaluations', evaluationController.viewEvaluations);
router.get('/get_evaluation', evaluationController.getEvaluation);
router.get('/get_respondents', evaluationController.getRespondents);

module.exports = router;