const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const db = require('../config/db');
const dashboardService = require('../services/dashboardService');
const PDFDocument = require('pdfkit');
const puppeteer = require('puppeteer');


// Set up multer for file uploads
const upload = multer({dest: 'uploads/'});

exports.uploadFile = (req, res) => {
    if (!req.session.user_id) {
        return res.status(403).json({message: 'You must be logged in to upload a file.'});
    }

    const file = req.file;
    if (!file) {
        return res.status(400).json({message: 'No file uploaded.'});
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
                    return res.status(500).json({message: 'Error inserting user data.', error: err.message});
                }

                const insertedUserIds = result.insertId;
                const studentValues = results
                    .filter(row => row.UserType === 'Student')
                    .map((row, index) => [insertedUserIds + index, row.ProgramID]);

                const studentQuery = "INSERT INTO STUDENT (StudentID, ProgramID) VALUES ?";
                db.query(studentQuery, [studentValues], (err) => {
                    if (err) {
                        console.error('Error inserting student data:', err);
                        return res.status(500).json({message: 'Error inserting student data.', error: err.message});
                    }

                    res.status(200).json({message: 'Data added successfully!'});
                });
            });
        });
};

exports.downloadSummary = async (req, res) => {
    if (!req.session.user_id) {
        return res.status(403).json({message: 'You must be logged in to upload a file.'});
    }
    try {
        const programStudentCounts = JSON.parse(await dashboardService.getProgramStudentCounts());
        const evaluationCounts = JSON.parse(await dashboardService.getEvaluationCounts());
        const responseCounts = JSON.parse(await dashboardService.getResponseCounts());

        if (!Array.isArray(programStudentCounts)) {
            throw new Error('programStudentCounts is not an array');
        }
        if (!Array.isArray(evaluationCounts)) {
            throw new Error('evaluationCounts is not an array');
        }
        if (!Array.isArray(responseCounts)) {
            throw new Error('responseCounts is not an array');
        }

        const doc = new PDFDocument();

        // Function to generate chart image using puppeteer
        const generateChartImage = async (chartConfig) => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setContent(`
                    <html>
                        <body>
                            <canvas id="chart" width="800" height="600"></canvas>
                            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                            <script>
                                const ctx = document.getElementById('chart').getContext('2d');
                                new Chart(ctx, {
                                    ...${JSON.stringify(chartConfig)},
                                    options: {
                                        ...${JSON.stringify(chartConfig.options)},
                                        animation: false
                                    }
                                });
                            </script>
                        </body>
                    </html>
                `);
            const chartElement = await page.$('#chart');
            const chartImage = await chartElement.screenshot();
            await browser.close();
            return Buffer.from(chartImage);
        };

        // Generate charts
        const programStudentChart = await generateChartImage({
            type: 'doughnut',
            data: {
                labels: programStudentCounts.map(item => item.ProgramName),
                datasets: [{
                    data: programStudentCounts.map(item => item.StudentCount),
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                cutout: '50%'
            }
        });

        const evaluationChart = await generateChartImage({
            type: 'doughnut',
            data: {
                labels: evaluationCounts.map(item => item.Status),
                datasets: [{
                    data: evaluationCounts.map(item => item.EvaluationCount),
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                cutout: '50%'
            }
        });

        const responseChart = await generateChartImage({
            type: 'bar',
            data: {
                labels: responseCounts.map(item => item.ProgramName),
                datasets: [
                    {
                        label: 'Responses',
                        data: responseCounts.map(item => item.Responses),
                        backgroundColor: '#36A2EB'
                    },
                    {
                        label: 'Expected Respondents',
                        data: responseCounts.map(item => item.ExpectedRespondents),
                        backgroundColor: '#FF6384'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        ticks: {
                            callback: function (value) {
                                return Number.isInteger(value) ? value : null;
                            }
                        }
                    }
                }
            }
        });
        const formatData = (data) => {
            return data.map(item => `${item.ProgramName || item.Status}: ${item.StudentCount || item.EvaluationCount || `Responses: ${item.Responses}, Expected Respondents: ${item.ExpectedRespondents}`}`).join('\n');
        };

        doc.fontSize(20).text('Program Student Counts', {align: 'center'});
        doc.fontSize(12).text('This chart shows the number of students enrolled in each program. The data is represented as a doughnut chart, with each segment corresponding to a different program.', {align: 'center'});
        doc.fontSize(12).text(`Numerical Data:\n${formatData(programStudentCounts)}`, {align: 'center'});
        doc.image(programStudentChart, {fit: [500, 300], align: 'center'});

        doc.addPage().fontSize(20).text('Evaluation Counts', {align: 'center'});
        doc.fontSize(12).text('This chart displays the status of evaluations. The data is represented as a doughnut chart, with each segment representing a different evaluation status such as Draft, Published, or Finished.', {align: 'center'});
        doc.fontSize(12).text(`Numerical Data:\n${formatData(evaluationCounts)}`, {align: 'center'});
        doc.image(evaluationChart, {fit: [500, 300], align: 'center'});

        doc.addPage().fontSize(20).text('Response Counts', {align: 'center'});
        doc.fontSize(12).text('This chart shows the number of responses received and the expected number of respondents for each program. The data is represented as a stacked bar chart, with different colors indicating actual responses and expected respondents.', {align: 'center'});
        doc.fontSize(12).text(`Numerical Data:\n${formatData(responseCounts)}`, {align: 'center'});
        doc.image(responseChart, {fit: [500, 300], align: 'center'});

        // Finalize PDF and send it as response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Summary.pdf');
        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.error('Error generating summary:', error);
        res.status(500).json({message: 'Error generating summary.', error: error.message});
    }
};

module.exports.upload = upload.single('file');