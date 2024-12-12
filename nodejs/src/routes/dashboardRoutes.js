const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/chart_data', dashboardController.getChartData);

module.exports = router;