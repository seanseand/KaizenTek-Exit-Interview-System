// TEMPORARY
document.addEventListener("DOMContentLoaded", function () {
    const answerForm = document.getElementById("answerForm");

    fetch("get_questions.php")
        .then(response => response.json())
        .then(data => {
            data.questions.forEach(question => {
                const questionLabel = document.createElement("label");
                questionLabel.textContent = question.questionDesc;

                const answerInput = document.createElement("textarea");
                answerInput.name = "answers[]";
                answerInput.required = true;

                answerForm.appendChild(questionLabel);
                answerForm.appendChild(answerInput);
            });

            const submitButton = document.createElement("button");
            submitButton.type = "submit";
            submitButton.textContent = "Submit Answers";
            answerForm.appendChild(submitButton);
        });
});

// load Questions based on selected sort option
function loadQuestions() {
    const sortOption = document.getElementById('sortOption').value;
    const xhr = new XMLHttpRequest();

    xhr.open('GET', `view_questions.php?sortOption=${sortOption}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById('questionsList').innerHTML = xhr.responseText;
        }
    };
    xhr.send();
}

// load Evaluations based on selected sort option
function loadEvaluations() {
    const sortOption = document.getElementById('evaluationSortOption').value;
    const xhr = new XMLHttpRequest();

    xhr.open('GET', `view_evaluations.php?sortOption=${sortOption}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById('evaluationsList').innerHTML = xhr.responseText;
        }
    };
    xhr.send();
}

// check Student Responses for a specific Evaluation ID
function checkResponses() {
    const evaluationID = document.getElementById('evaluationIDInput').value;
    if (!evaluationID) {
        alert("Please enter an Evaluation ID.");
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `check_responses.php?evaluationID=${evaluationID}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
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

// execute on page load
window.onload = function () {
    loadQuestions();
    loadEvaluations();
};