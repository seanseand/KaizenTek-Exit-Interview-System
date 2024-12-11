document.addEventListener('DOMContentLoaded', function() {
    function loadEvaluations() {
        const xhr = new XMLHttpRequest();

        xhr.open('GET', '/api/view_evaluations', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                const container = document.getElementById('resultsContainer');
                if (container && response.evaluations && response.evaluations.length > 0) {
                    container.innerHTML = '';
                    response.evaluations.forEach((evaluation) => {
                        const card = document.createElement('div');
                        card.classList.add('evaluation-card');
                        card.innerHTML = `
                            <h2>${evaluation.EvaluationName}</h2>
                            <p>Program: ${evaluation.ProgramName}</p>
                            <p id="respondent-count-${evaluation.EvaluationID}">Loading respondent count...</p>
                        `;
                        container.appendChild(card);
                        loadRespondentCounts(evaluation.EvaluationID);
                    });
                } else if (container) {
                    container.innerHTML = `
                        <p class="text-center">No evaluations found.</p>
                    `;
                }
            }
        };

        xhr.send();
    }

    function loadRespondentCounts(evaluationID) {
        const xhr = new XMLHttpRequest();

        xhr.open('GET', `/api/check_responses?evaluationID=${evaluationID}`, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                const respondentCountElement = document.getElementById(`respondent-count-${evaluationID}`);
                if (respondentCountElement) {
                    if (response.status === 'success') {
                        respondentCountElement.textContent = `Respondents: ${response.respondentCount}`;
                    } else {
                        respondentCountElement.textContent = 'No respondents yet.';
                    }
                }
            } else if (xhr.readyState === 4) {
                console.error('Failed to load respondent count:', xhr.statusText);
            }
        };

        xhr.send();
    }

    loadEvaluations();
});