// function to load questions based on the selected sorting option
function loadQuestions() {
    const sortOption = document.getElementById('sortOption').value;
    const xhr = new XMLHttpRequest();

    xhr.open('GET', `/api/view_questions?sortOption=${sortOption}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            const questionsListDiv = document.getElementById('questionsList');

            if (response.questions && response.questions.length > 0) {
                let tableHtml = `
                <table>
                    <tr>
                        <th>Question ID</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Creator ID</th>
                    </tr>
                `;

                response.questions.forEach((question) => {
                    tableHtml += `
                    <tr>
                        <td>${question.QuestionID}</td>
                        <td>${question.Description}</td>
                        <td>${question.Type}</td>
                        <td>${question.CreatorID}</td>
                    </tr>
                    `;
                });

                tableHtml += '</table>';
                questionsListDiv.innerHTML = tableHtml;
            } else {
                questionsListDiv.innerHTML = '<p>No questions found.</p>';
            }
        }
    };
    xhr.send();
}

// function to load evaluations based on the selected sorting option
function loadEvaluations() {
    const sortOption = document.getElementById('evaluationSortOption').value;
    const xhr = new XMLHttpRequest();

    xhr.open('GET', `/api/view_evaluations?sortOption=${sortOption}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            const evaluationsListDiv = document.getElementById('evaluationsList');

            if (response.evaluations && response.evaluations.length > 0) {
                let tableHtml = `
                    <table>
                        <tr>
                            <th>Evaluation ID</th>
                            <th>Evaluation Name</th>
                            <th>Program ID</th>
                            <th>Semester</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                        </tr>
                `;

                response.evaluations.forEach((evaluation) => {
                    // format the dates (Start Date and End Date)
                    const startDate = new Date(evaluation.StartDate).toLocaleDateString('en-GB');
                    const endDate = new Date(evaluation.EndDate).toLocaleDateString('en-GB');

                    tableHtml += `
                        <tr>
                            <td>${evaluation.EvaluationID}</td>
                            <td>${evaluation.EvaluationName}</td>
                            <td>${evaluation.ProgramID}</td>
                            <td>${evaluation.Semester}</td>
                            <td>${startDate}</td>
                            <td>${endDate}</td>
                            <td>${evaluation.Status}</td>
                        </tr>
                    `;
                });

                tableHtml += '</table>';
                evaluationsListDiv.innerHTML = tableHtml;
            } else {
                evaluationsListDiv.innerHTML = '<p>No evaluations found.</p>';
            }
        }
    };
    xhr.send();
}

// check student responses for a specific Evaluation ID
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

document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/get_username')
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                document.getElementById('usernameDisplay').textContent = data.username;
            } else {
                console.error('Error:', data.error);
            }
        })
        .catch(error => console.error('Error fetching username:', error));
});


// execute on page load
window.onload = function () {
    loadQuestions();
    loadEvaluations();
};