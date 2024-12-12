document.addEventListener('DOMContentLoaded', function () {
    let evaluationsData = [];  // Store evaluations globally for searching

    // Function to load evaluations
    function loadEvaluations() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/view_evaluations', true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                evaluationsData = response.evaluations || [];  // Store evaluations for searching

                // Filter evaluations to only include those with status "Finished" or "Published"
                const filteredEvaluations = evaluationsData.filter(evaluation => 
                    evaluation.Status === 'Finished' || evaluation.Status === 'Published'
                );

                const container = document.getElementById('resultsContainer');
                if (container && filteredEvaluations.length > 0) {
                    container.innerHTML = '';  // Clear previous evaluations
                    renderEvaluations(filteredEvaluations);  // Render filtered evaluations
                } else if (container) {
                    container.innerHTML = `<p class="text-center">No evaluations found.</p>`;
                }
            }
        };

        xhr.send();
    }

    // Function to render evaluations to the container
    function renderEvaluations(evaluations) {
        const container = document.getElementById('resultsContainer');
        evaluations.forEach((evaluation) => {
            const card = document.createElement('div');
            card.classList.add('evaluation-card');
            card.innerHTML = `
                <h2>${evaluation.EvaluationName}</h2>
                <p>Program: ${evaluation.ProgramName}</p>
                <p id="respondent-count-${evaluation.EvaluationID}">Loading respondent count...</p>
            `;
            card.onclick = function() {
                loadEvaluationModal(evaluation);
            };
            container.appendChild(card);
            loadRespondentCounts(evaluation.EvaluationID);
        });
    }

    // Function to load the modal with evaluation details
    function loadEvaluationModal(evaluation) {
        // document.getElementById('modal-evaluation-name').innerText = evaluation.EvaluationName;
        // document.getElementById('modal-program-name').innerText = evaluation.ProgramName;
        // document.getElementById('modal-semester').innerText = evaluation.Semester;
        // document.getElementById('modal-start-date').innerText = evaluation.StartDate;
        // document.getElementById('modal-end-date').innerText = evaluation.EndDate;

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('evaluationModal'));
        modal.show();
    }

    // Function to load respondent counts for an evaluation
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

    // Search functionality
    const searchInput = document.querySelector('input[type="search"]');
    searchInput.addEventListener('input', function () {
        const query = searchInput.value.toLowerCase();  // Get the search query
        const filteredEvaluations = evaluationsData.filter(evaluation =>
            evaluation.EvaluationName.toLowerCase().includes(query)  // Case-insensitive search
        );

        // Update the results container with filtered evaluations
        const container = document.getElementById('resultsContainer');
        container.innerHTML = '';  // Clear the container before adding filtered results

        if (filteredEvaluations.length > 0) {
            renderEvaluations(filteredEvaluations);  // Render filtered evaluations
        } else {
            container.innerHTML = `<p class="text-center">No evaluations found for "${query}".</p>`;
        }
    });

    // Initial call to load all evaluations
    loadEvaluations();
});
