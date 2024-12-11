document.addEventListener('DOMContentLoaded', async () => {
    const fetchData = async (url) => {
        const response = await fetch(url);
        return response.json();
    };

    const chartData = await fetchData('/api/chart_data');

    // Student-Program Population Doughnut Chart
    const studentProgramPopulationCtx = document.getElementById('studentProgramPopulationChart').getContext('2d');
    new Chart(studentProgramPopulationCtx, {
        type: 'doughnut',
        data: {
            labels: chartData.studentProgramData.map(item => item.ProgramName),
            datasets: [{
                data: chartData.studentProgramData.map(item => item.StudentCount),
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });

    // Evaluation Status Chart
    const evaluationStatusCtx = document.getElementById('evaluationStatusChart').getContext('2d');
    new Chart(evaluationStatusCtx, {
        type: 'doughnut',
        data: {
            labels: chartData.evaluationStatusData.map(item => item.Status),
            datasets: [{
                data: chartData.evaluationStatusData.map(item => item.EvaluationCount),
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });

    // Respondent Bar Chart
    const respondentBarCtx = document.getElementById('respondentBarChart').getContext('2d');
    new Chart(respondentBarCtx, {
        type: 'bar',
        data: {
            labels: chartData.respondentData.map(item => item.ProgramName),
            datasets: [
                {
                    label: 'Responses',
                    data: chartData.respondentData.map(item => item.Responses),
                    backgroundColor: '#36A2EB'
                },
                {
                    label: 'Expected Respondents',
                    data: chartData.respondentData.map(item => item.ExpectedRespondents),
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
});