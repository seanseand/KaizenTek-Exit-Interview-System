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
                        const startDate = new Date(evaluation.StartDate).toLocaleDateString('en-GB');
                        const endDate = new Date(evaluation.EndDate).toLocaleDateString('en-GB');

                        const card = document.createElement('div');
                        card.classList.add('evaluation-card');

                        card.innerHTML = `
                            <h2>${evaluation.EvaluationName}</h2>
                            <p>Program: ${evaluation.ProgramName}</p>
                            <p>Semester: ${evaluation.Semester}</p>
                            <p>Start Date: ${startDate}</p>
                            <p>End Date: ${endDate}</p>
                            <p>Status: ${evaluation.Status}</p>
                        `;

                        container.appendChild(card);
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

    loadEvaluations();
});

function checkResponses() {
    const evaluationID = document.getElementById('evaluationIDInput').value;
    if (!evaluationID) {
        alert("Please enter an Evaluation ID.");
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/api/check_responses?evaluationID=${evaluationID}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            const response = JSON.parse(xhr.responseText);
            const responseStatusDiv = document.getElementById('responseStatus');

            if (response.error) {
                responseStatusDiv.innerHTML = `<p style="color:red;">${response.error}</p>`;
            } else if (response.status === "no_responses") {
                responseStatusDiv.innerHTML = `<p>${response.message}</p>`;
            } else {
                // display the list of students who responded
                let studentList = "<h3>Student/s who responded:</h3><ol>";
                response.students.forEach(studentID => {
                    studentList += `<li>Student ID: ${studentID}</li>`;
                });
                studentList += "</ol>";
                responseStatusDiv.innerHTML = studentList;
            }
        }
    };
    xhr.send();
}