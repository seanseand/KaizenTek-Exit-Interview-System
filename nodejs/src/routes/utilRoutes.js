const express = require('express');
const router = express.Router();
const utilController = require('../controllers/utilController');

router.post('/upload', utilController.upload, utilController.uploadFile);
router.get('/download_summary', utilController.downloadSummary);

module.exports = router;