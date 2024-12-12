const dashboardService = require('../services/dashboardService');

exports.getChartData = async (req, res) => {
    try {
        const studentProgramData = await dashboardService.getProgramStudentCounts();
        const evaluationStatusData = await dashboardService.getEvaluationCounts();
        const respondentData = await dashboardService.getResponseCounts();

        res.json({
            studentProgramData: JSON.parse(studentProgramData),
            evaluationStatusData: JSON.parse(evaluationStatusData),
            respondentData: JSON.parse(respondentData)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving chart data', error: error.message });
    }
};